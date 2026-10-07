import Link from "next/link";
import { listStaticPagesForAdmin } from "@/lib/content-admin";

const STATUS_LABEL: Record<string, string> = {
  published: "Terbit",
  draft: "Draf",
  trashed: "Trash",
};

const STATUS_STYLE: Record<string, string> = {
  published: "border-line-strong text-ink",
  draft: "border-line-strong text-ink-2",
  trashed: "border-line-strong text-ink-3",
};

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Daftar halaman teks NYATA dari basis data. Catatan jujur: rute publik yang
 * merender isi ini belum tersambung — penyambungan menunggu keputusan RR.
 */
export default async function AdminPagesPage() {
  const rows = await listStaticPagesForAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
            Halaman
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            {rows.length} halaman teks
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-3">
            Untuk konten seperti Tentang RR dan Kebijakan Privasi versi
            basis data. Rute publiknya belum tersambung (halaman publik saat
            ini memakai kamus bawaan) — draf bisa disiapkan dari sekarang.
          </p>
        </div>
        <Link href="/admin/pages/new" className="btn btn-primary ml-auto">
          Halaman baru
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-line bg-subtle px-6 py-10 text-center">
          <p className="font-display text-xl leading-snug">
            Belum ada halaman teks.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
            Buat draf pertama (mis. Tentang RR) — slug akan mengunci alamatnya
            saat rute publik disambungkan.
          </p>
          <Link href="/admin/pages/new" className="btn btn-primary mt-5">
            Halaman baru
          </Link>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-md border border-line bg-surface">
          {rows.map((row) => (
            <li
              key={row.id}
              className="grid gap-x-4 gap-y-2 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/pages/${row.id}`}
                  className="focus-ring block truncate text-sm text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
                >
                  {row.titleEn ?? row.titleId ?? row.slug}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-3">
                  /{row.slug}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-sm border px-2 py-0.5 text-[11px] ${STATUS_STYLE[row.contentStatus] ?? STATUS_STYLE.draft}`}
              >
                {STATUS_LABEL[row.contentStatus] ?? row.contentStatus}
              </span>
              <span className="text-xs text-ink-3 sm:text-right">
                {dateFmt.format(row.updatedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
