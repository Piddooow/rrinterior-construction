import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterChip = { key: string; label: string; href: string };

/**
 * Chip saringan aktif — tautan nyata tanpa JS: menghapus satu saringan
 * cukup satu klik. Dipakai bar saringan maupun keadaan kosong; tanpa
 * "use client" agar bisa dirender server maupun klien. Sejak R15b prop
 * `soft` merender tautan Next tanpa tirai transisi (direktori karya).
 */
export function FilterChips({
  label,
  chips,
  removeLabel,
  clearHref,
  clearLabel,
  className,
  soft = false,
}: {
  label: string;
  chips: FilterChip[];
  removeLabel: string;
  clearHref?: string;
  clearLabel?: string;
  className?: string;
  soft?: boolean;
}) {
  if (chips.length === 0) return null;

  const chipClass =
    "focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-line-strong px-2.5 text-xs text-ink-2 transition-colors hover:bg-hover-surface";
  const clearClass =
    "focus-ring inline-flex min-h-11 items-center text-sm text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs text-ink-3">{label}</span>
      {chips.map((chip) =>
        soft ? (
          <Link
            key={chip.key}
            href={chip.href}
            scroll={false}
            data-no-transition
            aria-label={`${removeLabel}: ${chip.label}`}
            className={chipClass}
          >
            {chip.label}
            <span aria-hidden="true">×</span>
          </Link>
        ) : (
          <a
            key={chip.key}
            href={chip.href}
            aria-label={`${removeLabel}: ${chip.label}`}
            className={chipClass}
          >
            {chip.label}
            <span aria-hidden="true">×</span>
          </a>
        )
      )}
      {clearHref && clearLabel ? (
        soft ? (
          <Link
            href={clearHref}
            scroll={false}
            data-no-transition
            className={clearClass}
          >
            {clearLabel}
          </Link>
        ) : (
          <a href={clearHref} className={clearClass}>
            {clearLabel}
          </a>
        )
      ) : null}
    </div>
  );
}
