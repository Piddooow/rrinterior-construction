import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/db";
import { mediaAssets, type MediaAsset } from "@/db/schema";

/**
 * Unggahan media (server-only): validasi jenis & ukuran berkas, nama
 * penyimpanan dibuat sendiri (tanpa nama dari pengguna), lalu mendaftarkan
 * baris media_assets. Media baru selalu `consent_confirmed = false`
 * sampai tim RR menyetujuinya.
 */

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
} as const;

export type UploadInput = {
  mimeType: string;
  bytes: Uint8Array;
  mediaRole: "render" | "foto_lapangan";
  /** Nama ramah default (R25b): nama berkas asli dari operator. */
  name?: string | null;
  altTextEn?: string | null;
  altTextId?: string | null;
  credit?: string | null;
  consentConfirmed?: boolean;
};

const clean = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
};

const uploadDir = () =>
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");

/** Simpan berkas unggahan + daftarkan media; gagal = tidak ada sisa berkas. */
export async function uploadMedia(input: UploadInput): Promise<MediaAsset> {
  const extension =
    ALLOWED_TYPES[input.mimeType as keyof typeof ALLOWED_TYPES];
  if (!extension) {
    throw new Error(
      "Jenis berkas tidak didukung. Gunakan JPG, PNG, WebP, atau MP4."
    );
  }
  if (input.mediaRole !== "render" && input.mediaRole !== "foto_lapangan") {
    throw new Error("Peran media harus render atau foto lapangan.");
  }
  const isVideo = input.mimeType.startsWith("video/");
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (input.bytes.byteLength === 0) {
    throw new Error("Berkas kosong tidak bisa diunggah.");
  }
  if (input.bytes.byteLength > limit) {
    throw new Error(
      `Ukuran berkas melebihi batas ${Math.round(limit / (1024 * 1024))} MB.`
    );
  }

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const storedName = `${randomUUID()}.${extension}`;
  const filePath = path.join(dir, storedName);
  await writeFile(filePath, input.bytes);

  try {
    const [row] = await db
      .insert(mediaAssets)
      .values({
        id: `media-${randomUUID()}`,
        mediaType: isVideo ? "video" : "foto",
        mediaRole: input.mediaRole,
        fileUrl: `/uploads/${storedName}`,
        name: clean(input.name),
        altTextEn: clean(input.altTextEn),
        altTextId: clean(input.altTextId),
        credit: clean(input.credit),
        consentConfirmed: input.consentConfirmed ?? false,
        mimeType: input.mimeType,
        fileSize: input.bytes.byteLength,
        uploadStatus: "sukses",
      })
      .returning();
    return row;
  } catch (error) {
    // Pendaftaran gagal: jangan tinggalkan berkas yatim.
    await unlink(filePath).catch(() => {});
    throw error;
  }
}
