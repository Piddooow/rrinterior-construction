import Link from "next/link";
import { listProjectsForAdmin } from "@/lib/content-admin";
import {
  AdminProjectsList,
  type AdminProjectRow,
} from "@/components/admin-projects-list";

/** Daftar proyek NYATA dari basis data (semua status kecuali terhapus). */
export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rows = await listProjectsForAdmin();

  const projects: AdminProjectRow[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.titleEn ?? row.titleId ?? row.slug,
    status: row.contentStatus,
    location: row.generalLocation ?? "",
    year: row.yearCompleted ? String(row.yearCompleted) : "",
    updatedAt: row.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
            Proyek
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
            Kelola portofolio: simpan draf, terbitkan secara eksplisit, dan
            tarik kembali kapan pun. Halaman publik ikut menyegarkan diri
            setelah setiap aksi.
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-primary ml-auto">
          Proyek baru
        </Link>
      </div>

      <AdminProjectsList key={q ?? ""} projects={projects} initialQuery={q} />
    </div>
  );
}
