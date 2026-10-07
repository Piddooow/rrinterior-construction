/**
 * Label status proyek dan lokasi umum (PRD: status Selesai/Berjalan,
 * lokasi umum tanpa alamat detail).
 * Ikon pin dipakai karena benar-benar menandai lokasi (bukan dekorasi);
 * status selalu berbentuk teks sehingga terbaca tanpa bergantung warna.
 */
export function ProjectLabels({
  location,
  status,
}: {
  location?: string | null;
  status?: string | null;
}) {
  if (!location && !status) return null;

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
      {location ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21s-6.5-5.4-6.5-10.3A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.7C18.5 15.6 12 21 12 21Z" />
            <circle cx="12" cy="10.6" r="2.2" />
          </svg>
          {location}
        </span>
      ) : null}
      {status ? (
        <span className="inline-flex items-center rounded-sm border border-line-strong px-2 py-0.5 text-[11px] text-ink-2">
          {status}
        </span>
      ) : null}
    </div>
  );
}
