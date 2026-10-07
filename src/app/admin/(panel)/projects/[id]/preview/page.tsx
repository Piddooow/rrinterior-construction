import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/content-admin";

const STATUS_LABEL: Record<string, string> = {
  published: "Terbit",
  draft: "Draf",
  trashed: "Di Trash",
};

/**
 * Pratinjau pribadi proyek untuk SEMUA status (draf pun terlihat di sini).
 * Berada di dalam grup panel sehingga penjaga sesi (DAL) berlaku — halaman
 * ini tidak pernah tampil untuk pengunjung anonim dan tidak diindeks.
 */
export default async function AdminProjectPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") notFound();
  const project = await getProjectById(id);
  if (!project) notFound();

  const title = project.titleEn ?? project.titleId ?? project.slug;
  const status = STATUS_LABEL[project.contentStatus] ?? project.contentStatus;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-line bg-subtle px-4 py-3">
        <Link
          href={`/admin/projects/${project.id}`}
          className="focus-ring inline-flex min-h-11 items-center text-sm text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink lg:min-h-0"
        >
          ← Kembali ke editor
        </Link>
        <p className="text-sm text-ink-2">
          <span className="font-medium text-ink">Pratinjau pribadi</span> ·{" "}
          {status} — hanya terlihat oleh tim yang sudah masuk.
        </p>
      </div>

      {project.coverUrl ? (
        <figure className="overflow-hidden rounded-md border border-line bg-subtle">
          <Image
            src={project.coverUrl}
            alt={project.coverAltEn ?? project.coverAltId ?? title}
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
          />
        </figure>
      ) : (
        <p className="rounded-md border border-line bg-subtle px-4 py-6 text-sm text-ink-2">
          Belum ada foto utama yang diisi.
        </p>
      )}

      <div>
        <p className="text-xs uppercase tracking-wide text-ink-3">
          {project.coverRole === "render"
            ? "Render"
            : project.coverRole === "foto_lapangan"
              ? "Foto lapangan"
              : "Peran cover belum ditentukan"}
        </p>
        <h1 className="mt-2 font-display text-balance text-3xl leading-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-3">
          /{project.slug}
          {project.generalLocation ? ` · ${project.generalLocation}` : ""}
          {project.yearCompleted ? ` · ${project.yearCompleted}` : ""}
          {project.projectStatus
            ? ` · ${project.projectStatus === "selesai" ? "Selesai" : "Sedang berjalan"}`
            : ""}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="text-sm font-medium text-ink">Ringkasan — Inggris</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {project.summaryEn ?? "— belum diisi —"}
          </p>
          <h2 className="mt-5 text-sm font-medium text-ink">Lingkup — Inggris</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {project.scopeOfWorkEn ?? "— belum diisi —"}
          </p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-ink">Ringkasan — Indonesia</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {project.summaryId ?? "— belum diisi —"}
          </p>
          <h2 className="mt-5 text-sm font-medium text-ink">
            Lingkup — Indonesia
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {project.scopeOfWorkId ?? "— belum diisi —"}
          </p>
        </section>
      </div>

      <p className="text-xs leading-relaxed text-ink-3">
        Pratinjau ini menampilkan data teks proyek; galeri media mengikuti saat
        pengelolaan relasi galeri dibangun. Halaman publik hanya tampil setelah
        proyek diterbitkan.
      </p>
    </div>
  );
}
