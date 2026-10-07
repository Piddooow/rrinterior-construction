import Link from "next/link";

/** 404 di dalam panel (mis. id item tidak dikenal) — tetap berbingkai panel. */
export default function AdminPanelNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="font-display text-sm text-ink-3">404</p>
      <h1 className="font-display text-balance text-3xl leading-tight">
        Item tidak ditemukan
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-ink-2">
        Tautan ini mungkin sudah lama atau itemnya sudah dihapus dari panel.
      </p>
      <Link href="/admin" className="btn btn-secondary">
        Kembali ke Ringkasan
      </Link>
    </div>
  );
}
