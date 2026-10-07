import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets, type MediaAsset } from "@/db/schema";
import {
  deleteObject,
  headObject,
  presignPutObject,
  r2PublicUrl,
  readObjectHead,
  R2_KEY_PREFIX,
} from "@/lib/r2";

/**
 * Unggahan media (server-only), dua jalur (dokumen §8.3):
 *
 * 1. **Upload langsung (utama, R2)**: `startR2Upload` memvalidasi &
 *    menerbitkan presigned PUT berumur pendek + baris "diproses";
 *    `finalizeR2Upload` memverifikasi objek nyata (ada, ukuran, signature
 *    berkas) sebelum menandai "sukses". Header dari browser tidak dipercaya.
 * 2. **Lewat server (fallback transisi)**: `uploadMedia` menulis berkas ke
 *    `public/uploads` seperti sebelum R2 aktif. Dipakai selama environment
 *    storage belum dikonfigurasi.
 *
 * Media baru selalu `consent_confirmed = false` sampai tim RR menyetujuinya.
 */

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
} as const;

type AllowedMime = keyof typeof ALLOWED_TYPES;

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

export type StartUploadInput = {
  /** Nama ramah default (R25b): nama berkas asli dari operator. */
  fileName: string;
  mimeType: string;
  /** Ukuran deklarasi klien — hanya untuk validasi awal; ukuran final dari storage. */
  size: number;
  mediaRole: string;
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

/**
 * Signature berkas nyata (magic bytes). Header `Content-Type` dari browser
 * tidak cukup (dokumen §8.3.4) — ini yang memutuskan jenis sebenarnya.
 */
export function sniffMime(bytes: Uint8Array): AllowedMime | null {
  const at = (sig: number[], offset = 0) =>
    sig.every((byte, index) => bytes[offset + index] === byte);
  if (at([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (at([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (at([0x52, 0x49, 0x46, 0x46]) && at([0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  if (at([0x66, 0x74, 0x79, 0x70], 4)) return "video/mp4";
  return null;
}

/** Validasi metadata upload: jenis, peran, dan ukuran deklarasi (§8.3.1). */
export function validateUploadMeta(input: {
  mimeType: string;
  size: number;
  mediaRole: string;
}): { mimeType: AllowedMime; isVideo: boolean; limit: number } {
  const mimeType = input.mimeType as AllowedMime;
  if (!(mimeType in ALLOWED_TYPES)) {
    throw new Error(
      "Jenis berkas tidak didukung. Gunakan JPG, PNG, WebP, atau MP4."
    );
  }
  if (input.mediaRole !== "render" && input.mediaRole !== "foto_lapangan") {
    throw new Error("Peran media harus render atau foto lapangan.");
  }
  const isVideo = mimeType.startsWith("video/");
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!Number.isFinite(input.size) || input.size <= 0) {
    throw new Error("Berkas kosong tidak bisa diunggah.");
  }
  if (input.size > limit) {
    throw new Error(
      `Ukuran berkas melebihi batas ${Math.round(limit / (1024 * 1024))} MB.`
    );
  }
  return { mimeType, isVideo, limit };
}

/** Simpan berkas unggahan + daftarkan media; gagal = tidak ada sisa berkas. */
export async function uploadMedia(input: UploadInput): Promise<MediaAsset> {
  const { mimeType, isVideo } = validateUploadMeta({
    mimeType: input.mimeType,
    size: input.bytes.byteLength,
    mediaRole: input.mediaRole,
  });
  if (sniffMime(input.bytes) !== mimeType) {
    throw new Error(
      "Isi berkas tidak cocok dengan jenisnya (JPG, PNG, WebP, atau MP4)."
    );
  }
  const extension = ALLOWED_TYPES[mimeType];

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
        mimeType,
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

/**
 * Langkah 1 upload langsung: validasi → presigned PUT → baris "diproses".
 * Baris dibuat setelah presign sukses; bila upload tidak pernah finalisasi,
 * baris berstatus "diproses" menjadi kandidat cleanup (dokumen §8.3.7).
 */
export async function startR2Upload(
  input: StartUploadInput
): Promise<{
  mediaId: string;
  uploadUrl: string;
  expiresIn: number;
  maxBytes: number;
}> {
  const { mimeType, isVideo, limit } = validateUploadMeta(input);
  const key = `${R2_KEY_PREFIX}${randomUUID()}.${ALLOWED_TYPES[mimeType]}`;
  const expiresIn = 600;
  const uploadUrl = await presignPutObject(key, mimeType, expiresIn);

  const [row] = await db
    .insert(mediaAssets)
    .values({
      id: `media-${randomUUID()}`,
      mediaType: isVideo ? "video" : "foto",
      mediaRole: input.mediaRole as "render" | "foto_lapangan",
      fileUrl: r2PublicUrl(key),
      storageKey: key,
      name: clean(input.fileName),
      altTextEn: clean(input.altTextEn),
      altTextId: clean(input.altTextId),
      credit: clean(input.credit),
      consentConfirmed: input.consentConfirmed ?? false,
      mimeType,
      uploadStatus: "diproses",
    })
    .returning();

  return { mediaId: row.id, uploadUrl, expiresIn, maxBytes: limit };
}

async function failUpload(
  mediaId: string,
  key: string | null,
  message: string
): Promise<never> {
  if (key) await deleteObject(key).catch(() => {});
  await db
    .update(mediaAssets)
    .set({ uploadStatus: "gagal", updatedAt: new Date() })
    .where(eq(mediaAssets.id, mediaId));
  throw new Error(message);
}

/**
 * Langkah 2 upload langsung: verifikasi objek nyata sebelum masuk konten
 * (§8.3.4) — keberadaan, ukuran aktual, dan signature berkas. Objek tidak
 * valid dihapus dan baris ditandai "gagal".
 */
export async function finalizeR2Upload(mediaId: string): Promise<MediaAsset> {
  const [row] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))
    .limit(1);
  if (!row) throw new Error("Media tidak ditemukan.");
  if (row.uploadStatus !== "diproses" || !row.storageKey) {
    throw new Error("Upload ini tidak sedang menunggu verifikasi.");
  }
  const key = row.storageKey;

  const head = await headObject(key);
  if (!head) {
    return failUpload(
      mediaId,
      null,
      "Berkas tidak ditemukan di penyimpanan — upload dianggap gagal."
    );
  }

  try {
    validateUploadMeta({
      mimeType: row.mimeType ?? "",
      size: head.size,
      mediaRole: row.mediaRole,
    });
  } catch (error) {
    return failUpload(
      mediaId,
      key,
      error instanceof Error ? error.message : "Ukuran berkas tidak valid."
    );
  }

  const headBytes = await readObjectHead(key, 16);
  const sniffed = headBytes ? sniffMime(headBytes) : null;
  if (!sniffed || sniffed !== row.mimeType) {
    return failUpload(
      mediaId,
      key,
      "Isi berkas tidak cocok dengan jenisnya — upload dibatalkan."
    );
  }

  const [updated] = await db
    .update(mediaAssets)
    .set({
      uploadStatus: "sukses",
      fileSize: head.size,
      mimeType: sniffed,
      updatedAt: new Date(),
    })
    .where(eq(mediaAssets.id, mediaId))
    .returning();
  return updated;
}
