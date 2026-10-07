import {
  getTrashDependencies,
  listTrashForAdmin,
} from "@/lib/content-admin";
import {
  AdminTrashList,
  type AdminTrashRow,
} from "@/components/admin-trash-list";

/** Tempat sampah NYATA lintas entitas (proyek, layanan, halaman, media). */
export default async function AdminTrashPage() {
  const items = await listTrashForAdmin();

  const rows: AdminTrashRow[] = [];
  for (const item of items) {
    const deps =
      item.dependencies > 0
        ? await getTrashDependencies(item.type, item.id)
        : { count: 0, notes: [] as string[] };
    rows.push({
      type: item.type,
      id: item.id,
      label: item.label,
      trashedAt: item.trashedAt.toISOString(),
      dependencies: item.dependencies,
      notes: deps.notes,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
          Tempat sampah
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
          Item yang dipindahkan dari area kerja. Pemulihan selalu aman; hapus
          permanen ditahan selama masih ada dependensi yang harus
          diselesaikan lebih dulu.
        </p>
      </div>

      <AdminTrashList items={rows} />
    </div>
  );
}
