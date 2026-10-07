"use client";

import { waHref } from "@/lib/site";
import { WhatsAppGlyph } from "@/components/ui/channel-glyphs";

/**
 * Tombol WhatsApp yang konsisten & aksesibel: tautan nyata ke wa.me
 * dengan pesan siap edit (pengunjung yang menekan kirim), terbuka di tab
 * baru dengan rel aman, label berisi kanal (dan nomor bila diminta),
 * ukuran & cincin fokus dari kelas .btn.
 *
 * Varian primary memakai animasi **flow** (R14g): sapuan lingkaran masuk
 * dari sudut kanan bawah saat hover dan warna teks berbalik, dari sistem
 * `.btn` global. Warna memakai token primer sehingga otomatis benar di
 * mode terang/gelap, dan transisinya mati saat pengguna meminta
 * reduced-motion.
 */
export function WhatsAppButton({
  message,
  label,
  variant = "primary",
  className,
  onClick,
}: {
  message: string;
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}) {
  const isPrimary = variant === "primary";
  const btnClass = isPrimary ? "btn-primary" : "btn-secondary";

  return (
    <a
      href={waHref(message)}
      target="_blank"
      rel="noopener"
      onClick={onClick}
      className={`btn ${btnClass}${className ? ` ${className}` : ""}`}
    >
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <WhatsAppGlyph className="size-4 shrink-0" />
        {label}
      </span>
    </a>
  );
}
