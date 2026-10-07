import { notFound } from "next/navigation";
import {
  getStaticPageById,
  listContentRevisions,
} from "@/lib/content-admin";
import {
  AdminPageEditor,
  type AdminPageFormValue,
} from "@/components/admin-page-editor";

/**
 * Editor halaman teks NYATA. `id = "new"` menampilkan form kosong; id lain
 * memuat baris (semua status, termasuk Trash agar bisa dipulihkan) + riwayat.
 */
export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  const page = isNew ? null : await getStaticPageById(id);
  if (!isNew && !page) notFound();

  const revisions = page
    ? await listContentRevisions("page", page.id)
    : [];

  const value: AdminPageFormValue | null = page
    ? {
        id: page.id,
        slug: page.slug,
        status: page.contentStatus,
        titleEn: page.titleEn ?? "",
        titleId: page.titleId ?? "",
        bodyEn: page.bodyEn ?? "",
        bodyId: page.bodyId ?? "",
        updatedAt: page.updatedAt.toISOString(),
        publishedAt: page.publishedAt
          ? page.publishedAt.toISOString()
          : null,
      }
    : null;

  return (
    <AdminPageEditor
      isNew={isNew}
      page={value}
      revisions={revisions.map((revision) => ({
        id: revision.id,
        status: revision.status,
        createdAt: revision.createdAt.toISOString(),
      }))}
    />
  );
}
