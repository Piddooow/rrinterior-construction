import { listMediaForAdmin } from "@/lib/content-admin";
import {
  AdminMediaLibrary,
  type AdminMediaRow,
} from "@/components/admin-media-library";

/** Pustaka media NYATA dari basis data (unggah, ubah, trash). */
export default async function AdminMediaPage() {
  const items = await listMediaForAdmin();

  const rows: AdminMediaRow[] = items.map((item) => ({
    id: item.id,
    fileUrl: item.fileUrl,
    thumbnailUrl: item.thumbnailUrl,
    name: item.name ?? "",
    mediaType: item.mediaType,
    mediaRole: item.mediaRole,
    altEn: item.altTextEn ?? "",
    altId: item.altTextId ?? "",
    captionEn: item.captionEn ?? "",
    captionId: item.captionId ?? "",
    credit: item.credit ?? "",
    consent: item.consentConfirmed,
    mimeType: item.mimeType ?? "",
    fileSize: item.fileSize ?? 0,
    createdAt: item.createdAt.toISOString(),
  }));

  const videos = rows.filter((row) => row.mediaType === "video").length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-balance text-3xl leading-tight sm:text-4xl">
          Media
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          {rows.length} media · {rows.length - videos} foto · {videos} video
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-3">
          Berkas disimpan server dengan nama buatan sendiri; hanya media
          berizin tayang yang pernah tampil di situs. Unggahan baru masuk
          dalam keadaan belum berizin sampai disetujui di kartunya.
        </p>
      </div>

      <AdminMediaLibrary items={rows} />
    </div>
  );
}
