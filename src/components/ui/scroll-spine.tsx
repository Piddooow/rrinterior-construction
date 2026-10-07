"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

/* Setiap bagian halaman mendapat pita di tulang setinggi panjang bagiannya,
   jadi tulang itu adalah gambar berskala dari halaman. Penanda yang menutupi
   bagian yang sedang dibaca bergerak seperti ulat: tepi depannya melompat
   lebih dulu dan tepi belakang menyusul, sehingga ia meregang saat berjalan
   dan mengendap seukuran bagian yang ia hinggapi. */

export type SpineItem = { id: string; label: string };

type Band = { top: number; height: number };

// Ruang antar pita agar bagian yang berdekatan terbaca sebagai potongan
// terpisah.
const GAP = 8;
// Satu paragraf pun tetap dapat pita yang cukup besar untuk disorot dan
// diklik, dan cukup tinggi untuk baris judulnya saat label tampil.
// Pita berlabel dipatok >=44px agar sasaran sentuh di layar besar
// sekalipun tetap nyaman (Tahap H1) — tata letak proporsional tetap
// dihitung ulang dari `free`.
const MIN_BAND = 14;
const MIN_BAND_LABELLED = 44;
// Di bawah lebar ini tidak ada ruang untuk label di samping pita.
const INLINE_MIN = 120;
// Blok bagian aktif sedikit melewati pitanya.
const MARK_PAD = 4;
// Di mana "garis baca" berada: sepertiga dari atas adalah tempat mata
// beristirahat saat membaca.
const READ_LINE = 0.3;
// Beberapa trackpad berhenti beberapa piksel sebelum ujung.
const END_SLACK = 4;
// Ruang di atas judul setelah lompat ke sana, agar tidak menempel (dan tidak
// tersembunyi di bawah bilah atas yang sticky).
const DEFAULT_JUMP_OFFSET = 80;
// Tepi depan: cepat, agar penanda menjawab guliran seketika.
const LEAD = { type: "spring", visualDuration: 0.24, bounce: 0 } as const;
// Tepi belakang: sengaja lebih lambat — jeda itulah regangannya.
const TRAIL = { type: "spring", visualDuration: 0.42, bounce: 0 } as const;

type Target = { kind: "element"; el: HTMLElement } | { kind: "window" };

function metrics(target: Target) {
  if (target.kind === "window") {
    return {
      scrollTop: window.scrollY,
      viewport: window.innerHeight,
      height: document.documentElement.scrollHeight,
      // Rantai offsetTop mengabaikan transform — elemen ber-`data-reveal`
      // yang masih bergeser beberapa piksel saat diukur tidak boleh
      // menggeser posisi lompatannya. transform:translate tidak mengubah
      // offsetTop, jadi hasilnya selalu posisi final.
      offsetOf: (el: HTMLElement) => {
        let y = 0;
        let node: HTMLElement | null = el;
        while (node) {
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        return y;
      },
    };
  }
  const box = target.el;
  const top = box.getBoundingClientRect().top;
  return {
    scrollTop: box.scrollTop,
    viewport: box.clientHeight,
    height: box.scrollHeight,
    offsetOf: (el: HTMLElement) =>
      el.getBoundingClientRect().top - top + box.scrollTop,
  };
}

/**
 * "Di halaman ini" bergaya tulang: pita setinggi bagiannya, penanda ulat
 * yang mengikuti garis baca, dan lompatan halus ke tiap judul. Di halaman
 * asli, guliran window yang menggerakkannya (scrollRef dikosongkan).
 * Tanpa JS atau saat reduced-motion, penanda jatuh di posisi pita pertama
 * dan tautannya tetap berfungsi.
 */
export function ScrollSpine({
  items,
  scrollRef,
  height = 320,
  label,
  jumpOffset = DEFAULT_JUMP_OFFSET,
  className,
}: {
  items: SpineItem[];
  /* Elemen yang menggulir. Kosongkan untuk mengikuti window. Judul dicari
     lewat id di kedua kasus. */
  scrollRef?: React.RefObject<HTMLElement | null>;
  height?: number;
  label: string;
  /** Jarak aman dari atas saat melompat (tinggi bilah header sticky). */
  jumpOffset?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [bands, setBands] = useState<Band[]>([]);
  const [current, setCurrent] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  // Terang: tiap pita membawa judulnya. Sempit: pita saja, judul tampil
  // saat hover atau fokus.
  const [inline, setInline] = useState(true);
  const markTop = useMotionValue(0);
  const markBottom = useMotionValue(0);
  const markHeight = useTransform([markTop, markBottom], ([t, b]: number[]) =>
    Math.max(0, b - t),
  );
  const nav = useRef<HTMLElement>(null);
  const notch = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  // Event guliran membaca ini, jadi tidak pernah menunggu render.
  const offsets = useRef<number[]>([]);
  const docEnd = useRef(0);
  const bandsRef = useRef<Band[]>([]);
  const currentRef = useRef(0);
  const placed = useRef(false);
  // Sampai kapan pembaruan guliran diabaikan setelah sebuah lompatan.
  const lockUntil = useRef(0);

  const target = useCallback((): Target | null => {
    if (!scrollRef) return { kind: "window" };
    return scrollRef.current ? { kind: "element", el: scrollRef.current } : null;
  }, [scrollRef]);

  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setInline(entry.contentRect.width >= INLINE_MIN),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Ukur panjang tiap bagian dan susun pitanya secara proporsional.
  useEffect(() => {
    const t = target();
    if (!t) return;
    const minBand = inline ? MIN_BAND_LABELLED : MIN_BAND;
    const measure = () => {
      const m = metrics(t);
      const tops = items.map((item) => {
        const el = document.getElementById(item.id);
        return el ? m.offsetOf(el) : 0;
      });
      offsets.current = tops;
      docEnd.current = m.height;
      const lens = tops.map((top, i) =>
        Math.max(1, (tops[i + 1] ?? m.height) - top),
      );
      const total = lens.reduce((a, b) => a + b, 0);
      const free = height - GAP * (items.length - 1) - minBand * items.length;
      let y = 0;
      const next = lens.map((len) => {
        const band = { top: y, height: minBand + (free * len) / total };
        y += band.height + GAP;
        return band;
      });
      bandsRef.current = next;
      setBands(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(
      t.kind === "window" ? document.body : (t.el.firstElementChild ?? t.el),
    );
    // Presisi (Tahap H4): tinggi seksi sebelum font/gambar selesai bisa
    // berbeda beberapa piksel dan menggeser pita; ukur ulang setelah font
    // siap, setelah `load`, dan dua kali jeda agar posisi akhir pasti.
    const remeasure = () => measure();
    if (document.fonts) {
      document.fonts.ready.then(remeasure).catch(() => {});
    }
    window.addEventListener("load", remeasure);
    const first = window.setTimeout(remeasure, 350);
    const second = window.setTimeout(remeasure, 1200);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", remeasure);
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [items, height, target, inline]);

  // Ikuti guliran: titik baca dan bagian pita yang sudah dibaca ditulis
  // langsung ke DOM tiap frame; React hanya dengar saat bagian aktif berganti.
  useEffect(() => {
    const t = target();
    if (!t || bands.length === 0) return;
    const scroller: HTMLElement | Window = t.kind === "window" ? window : t.el;
    let frame = 0;

    // Menulis titik baca + bagian pita terisi untuk posisi (i, within).
    const paint = (i: number, within: number) => {
      const band = bandsRef.current[i];
      if (band && notch.current) {
        notch.current.style.transform = `translateY(${band.top + within * band.height}px)`;
      }
      fills.current.forEach((f, k) => {
        if (f) f.style.transform = `scaleY(${k < i ? 1 : k === i ? within : 0})`;
      });
    };

    const update = () => {
      frame = 0;
      // Setelah lompatan, biarkan penanda di bagian yang diklik sampai
      // guliran mengendap; tanpa ini garis baca di bagian pendek langsung
      // mencuri penanda ke bagian berikutnya.
      if (performance.now() < lockUntil.current) return;
      const m = metrics(t);
      const tops = offsets.current;
      const atEnd = m.scrollTop >= m.height - m.viewport - END_SLACK;
      const line = m.scrollTop + m.viewport * READ_LINE;
      let i = 0;
      while (i < tops.length - 1 && tops[i + 1] <= line) i++;
      if (atEnd) i = tops.length - 1;
      const start = tops[i];
      const end = tops[i + 1] ?? docEnd.current;
      const within = atEnd
        ? 1
        : Math.min(1, Math.max(0, (line - start) / (end - start)));
      paint(i, within);
      if (i !== currentRef.current) {
        currentRef.current = i;
        setCurrent(i);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [bands, target]);

  // Pindahkan penanda. Tepi di arah perjalanan yang memimpin.
  useEffect(() => {
    const band = bands[current];
    if (!band) return;
    const top = band.top - MARK_PAD;
    const bottom = band.top + band.height + MARK_PAD;
    if (!placed.current || reduceMotion) {
      placed.current = true;
      markTop.jump(top);
      markBottom.jump(bottom);
      return;
    }
    const down = top >= markTop.get();
    // Tidak dihentikan saat berpindah: animate() baru mengambil alih di
    // tengah penerbangan dan mempertahankan kecepatan tepinya.
    animate(markTop, top, down ? TRAIL : LEAD);
    animate(markBottom, bottom, down ? LEAD : TRAIL);
  }, [bands, current, reduceMotion, markTop, markBottom]);

  useEffect(
    () => () => {
      markTop.stop();
      markBottom.stop();
    },
    [markTop, markBottom],
  );

  const jump = (i: number) => {
    const t = target();
    if (!t) return;
    const top = Math.max(0, offsets.current[i] - jumpOffset);
    const behavior = reduceMotion ? "auto" : "smooth";
    // Kunci sebentar: penanda langsung pindah ke bagian yang diklik, dan
    // garis baca tidak mencurinya selama guliran mengendap.
    lockUntil.current = performance.now() + (reduceMotion ? 100 : 1000);
    const band = bandsRef.current[i];
    if (band && notch.current) {
      notch.current.style.transform = `translateY(${band.top}px)`;
    }
    fills.current.forEach((f, k) => {
      if (f) f.style.transform = `scaleY(${k < i ? 1 : 0})`;
    });
    currentRef.current = i;
    setCurrent(i);
    if (t.kind === "window") window.scrollTo({ top, behavior });
    else t.el.scrollTo({ top, behavior });
  };

  return (
    <nav
      ref={nav}
      aria-label={label}
      className={cn("relative w-[180px] shrink-0 select-none", className)}
      style={{ height }}
    >
      {/* Bagian aktif, sebagai blok lembut yang meregang dari pita ke pita. */}
      <motion.div
        aria-hidden
        style={{ top: markTop, height: markHeight }}
        className={cn(
          "absolute rounded-md bg-ink/[0.06]",
          inline ? "-left-2 right-0" : "left-1/2 w-5 -translate-x-1/2",
        )}
      />
      <ol className="absolute inset-0">
        {bands.map((band, i) => {
          const active = i === current;
          const shown = preview === i && !inline;
          return (
            <li
              key={items[i].id}
              className="absolute right-0 left-0"
              style={{ top: band.top, height: band.height }}
            >
              {/* Pitanya: setinggi bagiannya, terisi saat dibaca. */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-0 w-[3px] overflow-hidden rounded-full bg-ink/[0.12]",
                  inline ? "left-0" : "left-1/2 -translate-x-1/2",
                )}
              >
                <span
                  ref={(el) => {
                    fills.current[i] = el;
                  }}
                  // Ditulis oleh handler guliran; mulai kosong. Bukan utilitas
                  // scale Tailwind, yang akan mengalikannya.
                  style={{ transform: "scaleY(0)" }}
                  className="absolute inset-0 origin-top rounded-full bg-ink"
                />
              </span>
              <button
                type="button"
                aria-current={active ? "location" : undefined}
                onClick={() => jump(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "touch") setPreview(i);
                }}
                onPointerLeave={() => setPreview((p) => (p === i ? null : p))}
                onFocus={(e) => {
                  if (e.currentTarget.matches(":focus-visible")) setPreview(i);
                }}
                onBlur={() => setPreview((p) => (p === i ? null : p))}
                className={cn(
                  "focus-ring group/band absolute touch-manipulation rounded-md text-left transition-[scale] duration-150 ease-out active:scale-[0.96] motion-reduce:transition-none",
                  inline ? "inset-y-0 -left-2 right-0 pl-5" : "inset-0",
                )}
              >
                {inline ? (
                  <span
                    className={cn(
                      "block truncate text-[13px] leading-4 transition-[color] duration-150 ease-out",
                      active
                        ? "font-medium text-ink"
                        : "text-ink-3 group-hover/band:text-ink",
                    )}
                  >
                    {items[i].label}
                  </span>
                ) : (
                  <span className="sr-only">{items[i].label}</span>
                )}
              </button>
              {!inline && (
                // Label pratinjau, menggantung di kiri pita.
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-0 right-full z-10 mr-1 rounded-full bg-ink px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-canvas",
                    "transition-[opacity,translate,filter] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-x-0",
                    shown
                      ? "translate-x-0 opacity-100 blur-none duration-200"
                      : "translate-x-1.5 opacity-0 blur-[2px] duration-100",
                  )}
                >
                  {items[i].label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {/* Persis di garis baca, menunggangi pita. */}
      <div
        ref={notch}
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 -mt-[4.5px] size-[9px] rounded-full bg-ink ring-[3px] ring-canvas",
          inline ? "-left-[3px]" : "left-1/2 -ml-[4.5px]",
          bands.length === 0 && "opacity-0",
        )}
      />
    </nav>
  );
}
