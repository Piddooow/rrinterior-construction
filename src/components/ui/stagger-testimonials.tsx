"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 3000;
/**
 * Potongan sudut kartu mengikuti ukuran kartu (R16a): 50px pada ukuran
 * penuh, mengecil proporsional di ponsel supaya detail tetap seimbang.
 */
const cardClip = (cut: number) =>
  `polygon(${cut}px 0%, calc(100% - ${cut}px) 0%, 100% ${cut}px, 100% 100%, calc(100% - ${cut}px) 100%, ${cut}px 100%, 0 100%, 0 0)`;
const cardCut = (cardSize: number) =>
  cardSize >= 365 ? 50 : Math.round(cardSize * 0.172);

export type TestimonialDeckItem = {
  /** Kunci stabil (mis. tst-01) — kartu tidak pernah remount saat deck berputar. */
  id: string;
  quote: string;
  author: string;
  context?: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => /[a-z0-9]/i.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Posisi arena ala referensi StaggerTestimonials (21st.dev): daftar ganjil
 * berpusat di `(n+1)/2`, genap di `n/2`; posisi 0 = kartu tengah.
 */
function arenaPosition(arenaIndex: number, n: number): number {
  return n % 2 ? arenaIndex - (n + 1) / 2 : arenaIndex - n / 2;
}

function cardTransform(position: number, cardSize: number, isCenter: boolean) {
  return `
    translate(-50%, -50%)
    translateX(${(cardSize / 1.5) * position}px)
    translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
    rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
  `;
}

function CardFace({
  item,
  isCenter,
  cut,
  staticAuthor = false,
}: {
  item: TestimonialDeckItem;
  isCenter: boolean;
  cut: number;
  /** Ponsel: penulis mengalir setelah kutipan (tidak absolute) — anti-tumpuk. */
  staticAuthor?: boolean;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute block origin-top-right rotate-45"
        style={{
          right: -2,
          top: cut - 2,
          width: Math.round(cut * Math.SQRT2),
          height: 2,
          backgroundColor: "var(--border-subtle)",
        }}
      />
      {/* Slot foto referensi diganti monogram inisial (tanpa foto orang). */}
      <span
        aria-hidden="true"
        className={cn(
          "mb-4 flex h-14 w-12 items-center justify-center font-display text-lg leading-none",
          isCenter ? "bg-primary-ink text-primary" : "bg-subtle text-ink-2"
        )}
        style={{ boxShadow: "3px 3px 0 var(--canvas)" }}
      >
        {initials(item.author)}
      </span>
      <blockquote
        className={cn(
          "font-display text-base leading-snug text-balance sm:text-lg",
          isCenter ? "text-primary-ink" : "text-ink"
        )}
      >
        “{item.quote}”
      </blockquote>
      <p
        className={cn(
          staticAuthor
            ? "mt-6 text-sm italic"
            : "absolute inset-x-6 bottom-7 text-sm italic sm:inset-x-8 sm:bottom-8",
          isCenter ? "text-primary-ink/80" : "text-ink-3"
        )}
      >
        {item.author}
        {item.context ? (
          <span className="not-italic"> · {item.context}</span>
        ) : null}
      </p>
    </>
  );
}

/** Tombol navigasi dek — dipakai dek fan (desktop) dan kartu tunggal (ponsel). */
function DeckButtons({
  labels,
  move,
  className,
}: {
  labels: { prev: string; next: string };
  move: (steps: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {[
        { label: labels.prev, icon: ChevronLeft, steps: -1 },
        { label: labels.next, icon: ChevronRight, steps: 1 },
      ].map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={() => move(btn.steps)}
          aria-label={btn.label}
          className={cn(
            "focus-ring flex size-14 cursor-pointer items-center justify-center rounded-sm transition-colors",
            "border-2 border-line bg-canvas text-ink hover:bg-primary hover:text-primary-ink"
          )}
        >
          <btn.icon aria-hidden="true" className="size-6" />
        </button>
      ))}
    </div>
  );
}

/**
 * Deck ulasan bertumpuk — **perilaku persis referensi** StaggerTestimonials:
 * setiap kartu BERANGKAT ke slot barunya (semua kartu bergeser bersamaan,
 * transisi 500ms `ease-in-out`), bukan meluncur keluar ke samping. Klik
 * kartu membawanya ke tengah; tombol prev/next menggeser satu langkah.
 *
 * Penyesuaian situs: token warna PRD (bukan HSL shadcn), monogram inisial
 * sebagai pengganti foto, auto-slide tiap **3 detik** yang berhenti saat
 * kursor/fokus berada di deck (lanjut setelah pergi), dan reduced-motion
 * mematikan auto-slide tanpa mengubah fungsi tombol. Sejak R22f dek memakai
 * radius panel situs (rounded-md) dan tombol panah memakai radius tombol
 * situs (rounded-sm) supaya konsisten dengan kontrol lain.
 */
export function StaggerTestimonials({
  items,
  labels,
}: {
  items: TestimonialDeckItem[];
  labels: { region: string; prev: string; next: string };
}) {
  const n = items.length;
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [cardSize, setCardSize] = useState(365);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);

  const move = useCallback(
    (steps: number) => {
      if (!steps || n < 2) return;
      setOrder((current) => {
        const k = ((steps % n) + n) % n;
        if (k === 0) return current;
        return [...current.slice(k), ...current.slice(0, k)];
      });
    },
    [n]
  );

  // Auto-slide 3 detik: berhenti saat kursor/fokus di deck, tab tersembunyi,
  // atau reduced-motion.
  useEffect(() => {
    if (n < 2 || paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      if (!document.hidden) move(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [n, paused, move]);

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(!window.matchMedia("(min-width: 640px)").matches);
      if (window.matchMedia("(min-width: 640px)").matches) {
        setCardSize(365);
        return;
      }
      // Ponsel: kartu mengikuti lebar layar (66vw) dengan batas bawah dan
      // atas yang nyaman — tidak kekecilan di 320, tidak terlalu besar di
      // 430 (R16a).
      setCardSize(
        Math.max(215, Math.min(290, Math.round(window.innerWidth * 0.66)))
      );
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (n === 0) return null;

  const centerIndex = n % 2 ? (n + 1) / 2 : n / 2;
  const center = items[order[centerIndex]];

  // Ponsel (<640px): dek fan diganti satu kartu aliran normal supaya kutipan
  // dan baris penulis tidak pernah bertumpuk. Tinggi minimum stabil mencegah
  // halaman bergeser saat kartu berganti otomatis; transisi memakai kelas
  // `card-in` (sudah mematuhi reduced-motion di globals.css).
  if (isMobile) {
    const cut = 28;
    return (
      <div
        role="region"
        aria-label={labels.region}
        className="relative w-full rounded-md bg-subtle/40 p-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          key={center.id}
          data-center
          className="card-in relative min-h-[22rem] border-2 border-primary bg-primary p-6 text-primary-ink"
          style={{
            clipPath: cardClip(cut),
            boxShadow: "0px 8px 0px 4px var(--border-subtle)",
          }}
        >
          <CardFace item={center} isCenter cut={cut} staticAuthor />
        </div>
        <p className="sr-only" aria-live="polite">
          {center.author}
        </p>
        <DeckButtons labels={labels} move={move} className="mt-3" />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={labels.region}
      className="relative w-full overflow-hidden rounded-md bg-subtle/40"
      style={{ height: Math.round(cardSize * 1.644) }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {items.map((item, i) => {
        const position = arenaPosition(order.indexOf(i), n);
        const isCenter = position === 0;
        return (
          <div
            key={item.id}
            data-center={isCenter || undefined}
            onClick={() => move(position)}
            className={cn(
              "absolute left-1/2 top-1/2 cursor-pointer border-2 p-6 transition-all duration-500 ease-in-out motion-reduce:transition-none sm:p-8",
              isCenter
                ? "border-primary bg-primary text-primary-ink"
                : "border-line bg-surface text-ink hover:border-line-strong"
            )}
            style={{
              width: cardSize,
              height: cardSize,
              clipPath: cardClip(cardCut(cardSize)),
              transform: cardTransform(position, cardSize, isCenter),
              // Kedalaman eksplisit: kartu yang membungkus dari sisi mana pun
              // selalu lewat DI BAWAH kartu lain (R2) — bukan menimpa.
              zIndex: 10 - Math.abs(position),
              boxShadow: isCenter
                ? "0px 8px 0px 4px var(--border-subtle)"
                : "0px 0px 0px 0px transparent",
            }}
          >
            <CardFace item={item} isCenter={isCenter} cut={cardCut(cardSize)} />
          </div>
        );
      })}

      <p className="sr-only" aria-live="polite">
        {center.author}
      </p>

      <DeckButtons
        labels={labels}
        move={move}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      />
    </div>
  );
}
