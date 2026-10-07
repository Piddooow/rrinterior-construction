"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { InstagramGlyph } from "@/components/ui/channel-glyphs";
import { cn } from "@/lib/utils";

type FounderHoverCardProps = {
  name: string;
  role: string;
  href: string;
  handle: string;
  photoSrc: string;
  photoAlt: string;
  credit: string;
  /** Angka pengikut resmi; null berarti sembunyikan (tanpa angka karangan). */
  followers: number | null;
  followersLabel: string;
  locale: string;
};

/**
 * Nama pendiri yang membuka kartu profil saat disorot (R14h, mengikuti
 * referensi HoverCard dan disesuaikan ke token situs):
 * foto asli, nama, peran, kanal Instagram pribadi sebagai tautan nyata, dan
 * kredit foto. Angka pengikut hanya tampil bila sumber resmi tersedia
 * (R14j) — tanpa data, baris angka tidak dirender sama sekali.
 *
 * Interaksi ringan tanpa library gerak: kartu muncul dengan animasi CSS
 * sekali jalan, dan saat tertutup benar-benar tidak dirender (display none)
 * sehingga tidak pernah menambah area gulir halaman. Di ponsel kartu tampil
 * terpusat supaya tidak mungkin meluber; sejak sm kartu turun di bawah nama.
 * Papan ketik: fokus membuka kartu, Escape menutup, dan tautan di dalam
 * kartu tetap dapat dijangkau Tab. Area sentuh nama ditinggikan ke 44px
 * lewat padding + margin negatif sehingga baris teks tidak bergeser.
 */
export function FounderHoverCard({
  name,
  role,
  href,
  handle,
  photoSrc,
  photoAlt,
  credit,
  followers,
  followersLabel,
  locale,
}: FounderHoverCardProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  const formatted =
    followers === null
      ? null
      : new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(followers);

  // Menutup saat menekan di luar (penting untuk layar sentuh).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <span
      ref={rootRef}
      className="relative inline-block"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring relative -my-[9px] cursor-pointer rounded-sm py-[9px] font-medium text-ink underline decoration-ink-3/70 decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
      >
        {name}
      </button>

      <span
        id={id}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "z-40 rounded-md border border-line bg-surface p-3 text-left shadow-lg",
          // Ponsel: popover terpusat — tidak mungkin meluber keluar layar.
          "max-sm:fixed max-sm:top-1/2 max-sm:left-1/2 max-sm:w-[min(18rem,calc(100vw-2rem))] max-sm:-translate-x-1/2 max-sm:-translate-y-1/2",
          // Sejak sm: kartu turun di bawah nama.
          "sm:absolute sm:top-full sm:left-0 sm:mt-2 sm:w-72 sm:max-w-[calc(100vw-2.5rem)]",
          open ? "card-in block" : "hidden",
        )}
      >
        <span className="flex items-start gap-3">
          <Image
            src={photoSrc}
            alt={photoAlt}
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-sm object-cover"
          />
          <span className="min-w-0">
            <span className="block font-medium text-ink">{name}</span>
            <span className="mt-0.5 block text-xs leading-snug text-ink-2">
              {role}
            </span>
            <span className="mt-1 block text-xs text-ink-3">
              {handle}
              {formatted ? ` · ${formatted} ${followersLabel}` : ""}
            </span>
          </span>
        </span>
        <span className="mt-3 flex items-center justify-between gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener"
            className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-line-strong px-2.5 text-xs font-medium text-ink transition-colors hover:bg-hover-surface"
          >
            <InstagramGlyph className="size-3.5" />
            Instagram
          </a>
          <span className="text-[11px] text-ink-3">{credit}</span>
        </span>
      </span>
    </span>
  );
}
