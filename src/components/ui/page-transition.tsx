"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-mark";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Transisi antar-halaman (Tahap H8; state lintas-remount sejak R9): tirai
 * bertema + logo RR.
 *
 * Alur navigasi: klik tautan internal ditahan (preventDefault di fase
 * capture), tirai + logo masuk (~0,45 dtk), BARU rute berpindah di balik
 * tirai, tahan sejenak, lalu tirai keluar (~0,5 dtk) — total ±1,4 dtk.
 *
 * Sejak R9 seluruh state transisi hidup di lingkup modul, bukan state
 * komponen. Alasannya: mengganti bahasa mengganti segmen root `[locale]`,
 * sehingga layout — termasuk komponen ini — dipasang ulang di tengah
 * transisi. Dengan state modul, tirai tetap tertutup menyeberangi remount
 * dan instance baru melanjutkan fase keluar begitu halaman baru ter-commit,
 * bukan terpotong seketika.
 *
 * Sejak R14a ada fase `boot`: pada muat pertama tirai tampil sejak HTML
 * server dan baru dibuka setelah font serta gambar penting selesai dimuat
 * (min 0,6 dtk, maks 3,2 dtk, reduced-motion seketika), sehingga pengunjung
 * masuk ke halaman yang sudah lengkap. Tanpa JS, blok noscript di layout
 * menyembunyikan tirai.
 *
 * Sejak R15a seluruh situs terang (kecuali panel menu cokelat yang memakai
 * aset sendiri dan redup fungsional penampil foto), jadi tirai selalu
 * memakai skema terang — mesin pemilihan skema kontekstual dihapus agar
 * animasi transisi konsisten.
 *
 * Reduced-motion: transisi dilewati sama sekali (navigasi instan).
 * Overlay selalu `aria-hidden` dan tidak pernah menghalangi saat menganggur.
 */

const COVER_MS = 450; // tirai + logo masuk
const MIN_COVER_MS = 900; // total tertutup sebelum membuka (navigasi)
const REVEAL_MS = 500; // tirai + logo keluar
const SAFETY_MS = 2600; // pengaman bila navigasi tak kunjung selesai
// R14a: tirai boot pada muat pertama — tampil sejak HTML server, dibuka
// setelah font dan foto penting selesai dimuat (dengan batas aman supaya
// tidak pernah membebani; reduced-motion membukanya seketika).
const BOOT_MIN_MS = 600;
const BOOT_MAX_MS = 3200;

type Phase = "idle" | "boot" | "cover" | "reveal";
type TransitionSnapshot = { phase: Phase };

// Nilai awal modul = "boot": dokumen baru selalu mulai dengan tirai tertutup
// (termasuk HTML server), lalu dibuka oleh scheduleBootReveal.
let snapshot: TransitionSnapshot = { phase: "boot" };
let startedAt = 0;
let pendingHref: string | null = null;
let revealPending = false;
let bootScheduled = false;
let timers: number[] = [];
const listeners = new Set<() => void>();

const serverSnapshot: TransitionSnapshot = { phase: "boot" };

function emit() {
  for (const listener of listeners) listener();
}

function update(next: Partial<TransitionSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

function schedule(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, ms));
}

function clearTimers() {
  for (const id of timers) window.clearTimeout(id);
  timers = [];
}

function startCover() {
  clearTimers();
  revealPending = false;
  startedAt = performance.now();
  update({ phase: "cover" });
}

function reveal() {
  revealPending = false;
  update({ phase: "reveal" });
  schedule(() => update({ phase: "idle" }), REVEAL_MS + 40);
}

/**
 * R14a: buka tirai boot saat informasi penting sudah dimuat — font situs siap
 * dan gambar penting (eager/hero/parallax) selesai — dengan durasi tahan
 * minimum supaya tidak berkedip dan batas maksimum sebagai pengaman. Ringan:
 * hanya memeriksa beberapa gambar, bukan seluruh dokumen.
 */
function scheduleBootReveal() {
  if (bootScheduled) return;
  bootScheduled = true;
  if (prefersReducedMotion()) {
    update({ phase: "idle" });
    return;
  }
  const finish = () => {
    if (snapshot.phase !== "boot") return;
    // Dua frame cat halaman di bawah tirai sebelum membuka.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (snapshot.phase === "boot") reveal();
      });
    });
  };
  const bootStarted = performance.now();
  const importantImages = () =>
    Array.from(
      document.querySelectorAll<HTMLImageElement>(
        "img[loading='eager'], [data-hero-step] img, [data-parallax]"
      )
    );
  const check = () => {
    const elapsed = performance.now() - bootStarted;
    const fontsReady =
      typeof document.fonts === "undefined" || document.fonts.status === "loaded";
    const imagesReady =
      document.readyState === "complete" &&
      importantImages().every((img) => img.complete);
    if ((fontsReady && imagesReady && elapsed >= BOOT_MIN_MS) || elapsed >= BOOT_MAX_MS) {
      finish();
      return;
    }
    schedule(check, 120);
  };
  check();
}

/**
 * Jadwalkan pembukaan tirai: hormati masa tahan minimum, beri dua frame
 * agar cat pertama halaman baru selesai. Idempoten — aman dipanggil dari
 * beberapa pemicu (pathname berubah, remount, pengaman).
 */
function scheduleReveal() {
  if (revealPending || snapshot.phase !== "cover") return;
  revealPending = true;
  pendingHref = null;
  const wait = Math.max(MIN_COVER_MS - (performance.now() - startedAt), 40);
  schedule(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => schedule(reveal, 20));
    });
  }, wait);
}

export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const { phase } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const lastPath = useRef(pathname);
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Rute benar-benar berganti di instance yang sama → lanjutkan ke fase
  // keluar (pathname berubah hanya lewat navigasi nyata).
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    scheduleReveal();
  }, [pathname]);

  // Instance baru dengan tirai masih tertutup (remount ganti bahasa):
  // halaman baru baru saja ter-commit — lanjutkan ke fase keluar. Pada muat
  // pertama, buka tirai boot begitu informasi penting selesai dimuat.
  useEffect(() => {
    if (snapshot.phase === "boot") scheduleBootReveal();
    else if (snapshot.phase === "cover" && pendingHref !== null) scheduleReveal();
    // Sengaja hanya saat mount; pembaruan lain ditangani efek pathname.
  }, []);

  // Klik tautan internal: tahan, tutup tirai, baru pindah rute.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (prefersReducedMotion()) return;
      if (snapshot.phase !== "idle") {
        event.preventDefault();
        return;
      }
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.dataset.noTransition !== undefined) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/admin")) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return; // tautan ke halaman yang sama (termasuk hash): biarkan bawaan
      }

      event.preventDefault();
      const destination = url.pathname + url.search + url.hash;
      startCover();
      pendingHref = destination;
      schedule(() => {
        if (!pendingHref) return;
        routerRef.current.push(pendingHref);
      }, COVER_MS);
      schedule(() => {
        scheduleReveal();
      }, SAFETY_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const active = phase !== "idle";
  // Tirai tampil pada fase boot (muat pertama) dan cover (navigasi).
  const shown = phase === "cover" || phase === "boot";

  return (
    <div
      data-page-transition
      data-phase={phase}
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[90] flex items-center justify-center bg-canvas text-ink",
        active ? "pointer-events-auto" : "pointer-events-none",
      )}
      style={{
        opacity: shown ? 1 : 0,
        transition: `opacity ${phase === "reveal" ? REVEAL_MS : COVER_MS}ms ease-out`,
      }}
    >
      <div
        className="transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown
            ? "translateY(0) scale(1)"
            : phase === "reveal"
              ? "translateY(0) scale(1.04)"
              : "translateY(10px) scale(0.92)",
          transitionDuration: `${phase === "reveal" ? REVEAL_MS - 60 : COVER_MS + 80}ms`,
        }}
      >
        <BrandLogo eager className="h-28 w-auto sm:h-32" />
      </div>
    </div>
  );
}
