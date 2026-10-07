import { notFound } from "next/navigation";
import {
  getServiceById,
  listContentRevisions,
} from "@/lib/content-admin";
import {
  AdminServiceEditor,
  type AdminServiceFormValue,
} from "@/components/admin-service-editor";

/**
 * Editor layanan NYATA. `id = "new"` menampilkan form kosong; id lain memuat
 * baris (semua status, termasuk Trash agar bisa dipulihkan) + riwayat.
 */
export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  const service = isNew ? null : await getServiceById(id);
  if (!isNew && !service) notFound();

  const revisions = service
    ? await listContentRevisions("service", service.id)
    : [];

  const value: AdminServiceFormValue | null = service
    ? {
        id: service.id,
        slug: service.slug,
        status: service.contentStatus,
        titleEn: service.titleEn ?? "",
        titleId: service.titleId ?? "",
        descriptionEn: service.descriptionEn ?? "",
        descriptionId: service.descriptionId ?? "",
        sortOrder: String(service.sortOrder ?? ""),
        updatedAt: service.updatedAt.toISOString(),
        publishedAt: service.publishedAt
          ? service.publishedAt.toISOString()
          : null,
      }
    : null;

  return (
    <AdminServiceEditor
      isNew={isNew}
      service={value}
      revisions={revisions.map((revision) => ({
        id: revision.id,
        status: revision.status,
        createdAt: revision.createdAt.toISOString(),
      }))}
    />
  );
}
