import Link from "next/link";
import { listServicesForAdmin } from "@/lib/content-admin";

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

/** Daftar layanan NYATA dari basis data (semua status kecuali terhapus). */
export default async function AdminServicesPage() {
  const rows = await listServicesForAdmin();
  const published = rows.filter(
    (row) => row.contentStatus === "published"
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
            Layanan
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            {rows.length} layanan · {published} terbit
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-3">
            Urutan di sini menentukan urutan daftar di halaman Layanan publik;
            perubahan langsung menyegarkan situs setelah disimpan.
          </p>
        </div>
        <Link href="/admin/services/new" className="btn btn-primary ml-auto">
          Layanan baru
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-line bg-subtle px-6 py-10 text-center">
          <p className="font-display text-xl leading-snug">Belum ada layanan.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
            Mulai dari satu layanan baru; simpan sebagai draf lebih dulu, lalu
            terbitkan setelah deskripsinya siap.
          </p>
          <Link href="/admin/services/new" className="btn btn-primary mt-5">
            Layanan baru
          </Link>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-md border border-line bg-surface">
          {rows.map((row) => (
            <li
              key={row.id}
              className="grid gap-x-4 gap-y-2 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center"
            >
              <span className="font-display text-sm text-ink-3">
                /{row.sortOrder}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/admin/services/${row.id}`}
                  className="focus-ring block truncate text-sm text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
                >
                  {row.titleEn ?? row.titleId ?? row.slug}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-3">
                  {row.descriptionEn ?? row.descriptionId ?? "— belum diisi —"}
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
