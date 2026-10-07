"use client";

import Link from "next/link";

/**
 * Batas galat area admin (R5): pesan singkat dan tombol ulang; panel tetap
 * memakai gaya minimal agar gangguan tidak menakutkan pengguna awam.
 */
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="font-display text-balance text-2xl leading-snug">
        Terjadi gangguan saat memuat layar ini
      </h1>
      <p className="text-sm leading-relaxed text-ink-2">
        Data Anda tidak hilang. Muat ulang layar ini; bila tetap sama, kembali
        ke Ringkasan lalu coba lagi.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Muat ulang layar
        </button>
        <Link href="/admin" className="btn btn-secondary">
          Kembali ke Ringkasan
        </Link>
      </div>
    </div>
  );
}
