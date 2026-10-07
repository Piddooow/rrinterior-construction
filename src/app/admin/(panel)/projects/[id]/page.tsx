import { notFound } from "next/navigation";
import {
  getProjectById,
  listContentRevisions,
  listMediaForAdmin,
  listProjectMediaForAdmin,
} from "@/lib/content-admin";
import {
  AdminProjectEditor,
  type AdminProjectFormValue,
} from "@/components/admin-project-editor";

/**
 * Editor proyek NYATA. `id = "new"` menampilkan form kosong untuk draf baru;
 * id lain memuat baris (semua status, termasuk Trash agar bisa dipulihkan)
 * beserta riwayat publikasinya.
 */
export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  const project = isNew ? null : await getProjectById(id);
  if (!isNew && !project) notFound();

  const revisions = project
    ? await listContentRevisions("project", project.id)
    : [];

  const galleryItems = project
    ? await listProjectMediaForAdmin(project.id)
    : [];
  const attachedIds = new Set(galleryItems.map((item) => item.mediaId));
  const allMedia = await listMediaForAdmin();
  const galleryOptions = project
    ? allMedia
        .filter((media) => !attachedIds.has(media.id))
        .map((media) => ({
          id: media.id,
          label: `${media.name ?? media.fileUrl.split("/").pop() ?? media.fileUrl} — ${
            media.altTextEn ?? media.altTextId ?? "tanpa alt"
          }${media.consentConfirmed ? "" : " (belum berizin)"}`,
        }))
    : [];
  // Pemilih foto utama (R25a): hanya foto, nama ramah dengan fallback berkas.
  const coverOptions = allMedia
    .filter((media) => media.mediaType === "foto")
    .map((media) => ({
      id: media.id,
      fileUrl: media.fileUrl,
      thumbnailUrl: media.thumbnailUrl,
      name: media.name ?? media.fileUrl.split("/").pop() ?? media.fileUrl,
      consent: media.consentConfirmed,
    }));

  const value: AdminProjectFormValue | null = project
    ? {
        id: project.id,
        slug: project.slug,
        status: project.contentStatus,
        titleEn: project.titleEn ?? "",
        titleId: project.titleId ?? "",
        summaryEn: project.summaryEn ?? "",
        summaryId: project.summaryId ?? "",
        scopeEn: project.scopeOfWorkEn ?? "",
        scopeId: project.scopeOfWorkId ?? "",
        roomType: project.roomType ?? "",
        location: project.generalLocation ?? "",
        projectStatus:
          project.projectStatus === "selesai" ||
          project.projectStatus === "berjalan"
            ? project.projectStatus
            : "",
        year: project.yearCompleted ? String(project.yearCompleted) : "",
        sortOrder: String(project.sortOrder ?? ""),
        coverUrl: project.coverUrl ?? "",
        coverRole:
          project.coverRole === "render" ||
          project.coverRole === "foto_lapangan"
            ? project.coverRole
            : "",
        coverAltEn: project.coverAltEn ?? "",
        coverAltId: project.coverAltId ?? "",
        updatedAt: project.updatedAt.toISOString(),
        publishedAt: project.publishedAt
          ? project.publishedAt.toISOString()
          : null,
      }
    : null;

  return (
    <AdminProjectEditor
      isNew={isNew}
      project={value}
      revisions={revisions.map((revision) => ({
        id: revision.id,
        status: revision.status,
        createdAt: revision.createdAt.toISOString(),
      }))}
      gallery={{
        items: galleryItems.map((item) => ({
          mediaId: item.mediaId,
          fileUrl: item.fileUrl,
          thumbnailUrl: item.thumbnailUrl,
          mediaType: item.mediaType,
          mediaRole: item.mediaRole,
          altEn: item.altEn ?? "",
          altId: item.altId ?? "",
          consent: item.consent,
          mediaTrashed: item.mediaTrashed,
          section: item.section ?? "",
        })),
        options: galleryOptions,
      }}
      coverOptions={coverOptions}
    />
  );
}
