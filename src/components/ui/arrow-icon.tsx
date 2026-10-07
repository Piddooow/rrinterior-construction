import { cn } from "@/lib/utils";

/**
 * Panah ikon situs (bentuk dari referensi tautan email di footer): 16×16,
 * stroke 1.5, panah ↗. Satu sumber untuk semua panah dekoratif agar gaya
 * konsisten di seluruh halaman; makna mengikuti konteks, panah ke bawah
 * cukup diputar 135°.
 */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      data-arrow
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block size-3.5 shrink-0 align-[-2px]", className)}
    >
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}
