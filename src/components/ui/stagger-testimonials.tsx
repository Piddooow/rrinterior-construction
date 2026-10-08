"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
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

/**
 * Layout effect di klien, effect biasa saat SSR: ukuran kartu ponsel
 * dikoreksi sebelum paint pertama supaya panel tidak berkedip di 365px.
 */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

/**
 * Kipas yang sama di semua lebar: langkah kartu `cardSize/1.5`; angkat
 * kartu memakai rasio desktop (-65px/±15px pada 365px = 0.178/0.041 ×
 * cardSize) supaya komposisi ponsel proporsional — bukan konstanta
 * piksel yang kaku.
 */
function cardTransform(position: number, cardSize: number, isCenter: boolean) {
  const lift = Math.round(cardSize * (isCenter ? 0.178 : 0.041));
  return `
    translate(-50%, -50%)
    translateX(${(cardSize / 1.5) * position}px)
    translateY(${isCenter ? -lift : position % 2 ? lift : -lift}px)
    rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
  `;
}

function CardFace({
  item,
  isCenter,
  cut,
  compact,
}: {
  item: TestimonialDeckItem;
  isCenter: boolean;
  cut: number;
  /** Kartu ponsel: padding, monogram, dan tipografi ikut mengecil supaya
   *  kutipan dan baris penulis tetap punya ruang (anti-tumpuk). */
  compact: boolean;
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
          "flex items-center justify-center font-display leading-none",
          compact ? "mb-2.5 h-10 w-9 text-sm" : "mb-4 h-14 w-12 text-lg",
          isCenter ? "bg-primary-ink text-primary" : "bg-subtle text-ink-2"
        )}
        style={{ boxShadow: "3px 3px 0 var(--canvas)" }}
      >
        {initials(item.author)}
      </span>
      <blockquote
        className={cn(
          "font-display leading-snug text-balance",
          compact ? "text-sm" : "text-base sm:text-lg",
          isCenter ? "text-primary-ink" : "text-ink"
        )}
      >
        “{item.quote}”
      </blockquote>
      <p
        className={cn(
          "absolute italic",
          compact
            ? "inset-x-4 bottom-4 text-xs"
            : "inset-x-6 bottom-7 text-sm sm:inset-x-8 sm:bottom-8",
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

/** Tombol navigasi dek — dipakai kipas desktop & kipas kecil ponsel. */
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
            "focus-ring flex size-12 cursor-pointer items-center justify-center rounded-sm transition-colors sm:size-14",
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
 * Deck ulasan bertumpuk — perilaku persis referensi StaggerTestimonials:
 * setiap kartu BERANGKAT ke slot barunya (semua kartu bergeser bersamaan,
 * transisi 500ms `ease-in-out`), bukan meluncur keluar ke samping. Klik
 * kartu membawanya ke tengah; tombol prev/next menggeser satu langkah.
 *
 * Ponsel memakai kipas yang SAMA (bukan satu kartu): kartu ~66vw
 * (landasan 224px, atap 300px) dengan detail compact supaya kutipan dan
 * baris penulis tidak pernah bertumpuk; desktop tetap 365px penuh.
 *
 * Auto-slide 3 detik berhenti saat kursor/fokus di deck, tab tersembunyi,
 * atau reduced-motion — dan hitungannya mengulang setelah aksi manual
 * supaya slide tidak menyusul tepat setelah pengguna memilih kartu.
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
  const [compact, setCompact] = useState(false);
  const [paused, setPaused] = useState(false);
  const [manualTick, setManualTick] = useState(0);

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

  /** Aksi manual pengguna: geser satu langkah + ulang hitungan auto-slide. */
  const manualMove = useCallback(
    (steps: number) => {
      move(steps);
      setManualTick((tick) => tick + 1);
    },
    [move]
  );

  // Auto-slide 3 detik: berhenti saat kursor/fokus di deck, tab tersembunyi,
  // atau reduced-motion; hitungan mulai ulang tiap aksi manual (manualTick).
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
  }, [n, paused, move, manualTick]);

  useIsoLayoutEffect(() => {
    const updateSize = () => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        setCompact(false);
        setCardSize(365);
        return;
      }
      // Ponsel: kipas yang sama diperkecil — 66vw dengan batas nyaman
      // (landasan 240px supaya kutipan terpanjang tetap utuh di 320px,
      // atap 300px supaya kartu tidak kebesaran di layar lebar).
      setCompact(true);
      setCardSize(
        Math.max(240, Math.min(300, Math.round(window.innerWidth * 0.66)))
      );
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (n === 0) return null;

  const centerIndex = n % 2 ? (n + 1) / 2 : n / 2;
  const center = items[order[centerIndex]];
  // Tinggi panel mengikuti kipas (1.644 × kartu — rasio desktop yang sama)
  // plus ruang ekstra di ponsel untuk baris tombol yang ukurannya tetap.
  const height = Math.round(cardSize * 1.644) + (compact ? 24 : 0);

  return (
    <div
      role="region"
      aria-label={labels.region}
      className="relative w-full overflow-hidden rounded-md bg-subtle/40"
      style={{ height }}
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
            onClick={() => manualMove(position)}
            className={cn(
              "absolute left-1/2 top-1/2 cursor-pointer border-2 transition-all duration-500 ease-in-out motion-reduce:transition-none",
              compact ? "p-4" : "p-6 sm:p-8",
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
            <CardFace
              item={item}
              isCenter={isCenter}
              cut={cardCut(cardSize)}
              compact={compact}
            />
          </div>
        );
      })}

      <p className="sr-only" aria-live="polite">
        {center.author}
      </p>

      <DeckButtons
        labels={labels}
        move={manualMove}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      />
    </div>
  );
}
