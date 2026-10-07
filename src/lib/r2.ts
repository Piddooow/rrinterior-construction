import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Klien Cloudflare R2 (S3-compatible) — server-only (dokumen §8).
 *
 * - Kredensial hanya dari environment; browser tidak pernah menerimanya.
 * - Browser hanya menerima presigned URL berumur pendek untuk satu operasi
 *   (PUT satu object, Content-Type terkunci) saat upload langsung.
 * - URL publik stabil dibentuk dari `R2_PUBLIC_BASE_URL` + object key —
 *   bukan URL bertanda tangan (dokumen §8.2.2).
 */

/** Semua object media hidup di bawah prefix ini (paritas URL lama). */
export const R2_KEY_PREFIX = "uploads/";

export type R2Config = {
  bucket: string;
  publicBase: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/** Konfigurasi storage dari environment; null bila belum lengkap. */
export function r2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    return null;
  }
  return {
    bucket,
    publicBase,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
  };
}

export function isR2Configured(): boolean {
  return r2Config() !== null;
}

let cached: { key: string; client: S3Client } | null = null;

function client(): { cfg: R2Config; s3: S3Client } {
  const cfg = r2Config();
  if (!cfg) {
    throw new Error("Object storage (R2) belum dikonfigurasi.");
  }
  const key = `${cfg.endpoint}|${cfg.bucket}|${cfg.accessKeyId}`;
  if (!cached || cached.key !== key) {
    cached = {
      key,
      client: new S3Client({
        region: "auto",
        endpoint: cfg.endpoint,
        credentials: {
          accessKeyId: cfg.accessKeyId,
          secretAccessKey: cfg.secretAccessKey,
        },
      }),
    };
  }
  return { cfg, s3: cached.client };
}

/** URL publik stabil untuk sebuah object key (disimpan di database). */
export function r2PublicUrl(key: string): string {
  const cfg = r2Config();
  if (!cfg) throw new Error("Object storage (R2) belum dikonfigurasi.");
  return `${cfg.publicBase}/${key}`;
}

/**
 * Presigned PUT: satu object, Content-Type terkunci, umur pendek (§8.3.3).
 * URL ini tidak pernah disimpan di database.
 */
export async function presignPutObject(
  key: string,
  contentType: string,
  expiresIn = 600
): Promise<string> {
  const { cfg, s3 } = client();
  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

function httpStatus(error: unknown): number | undefined {
  return (error as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
}

/** Metadata objek (ukuran & tipe hasil sisi server); null bila tidak ada. */
export async function headObject(
  key: string
): Promise<{ size: number; contentType: string | null } | null> {
  const { cfg, s3 } = client();
  try {
    const result = await s3.send(
      new HeadObjectCommand({ Bucket: cfg.bucket, Key: key })
    );
    return {
      size: result.ContentLength ?? 0,
      contentType: result.ContentType ?? null,
    };
  } catch (error) {
    if (httpStatus(error) === 404) return null;
    throw error;
  }
}

/** Beberapa byte pertama object — cek signature berkas nyata (§8.3.4). */
export async function readObjectHead(
  key: string,
  bytes = 16
): Promise<Uint8Array | null> {
  const { cfg, s3 } = client();
  try {
    const result = await s3.send(
      new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Range: `bytes=0-${Math.max(bytes - 1, 0)}`,
      })
    );
    if (!result.Body) return null;
    return await result.Body.transformToByteArray();
  } catch (error) {
    if (httpStatus(error) === 404) return null;
    throw error;
  }
}

/** Unduh utuh (skrip migrasi: verifikasi checksum) — null bila tidak ada. */
export async function readObjectAll(key: string): Promise<Uint8Array | null> {
  const { cfg, s3 } = client();
  try {
    const result = await s3.send(
      new GetObjectCommand({ Bucket: cfg.bucket, Key: key })
    );
    if (!result.Body) return null;
    return await result.Body.transformToByteArray();
  } catch (error) {
    if (httpStatus(error) === 404) return null;
    throw error;
  }
}

export async function deleteObject(key: string): Promise<void> {
  const { cfg, s3 } = client();
  await s3.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
}

/** Upload langsung dari server (skrip migrasi media lama). */
export async function putObject(
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<void> {
  const { cfg, s3 } = client();
  await s3.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/** Daftar object pada satu prefix (skrip cleanup). */
export async function listObjectKeys(
  prefix: string
): Promise<{ key: string; size: number; lastModified: Date | null }[]> {
  const { cfg, s3 } = client();
  const out: { key: string; size: number; lastModified: Date | null }[] = [];
  let token: string | undefined;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: cfg.bucket,
        Prefix: prefix,
        ContinuationToken: token,
      })
    );
    for (const item of page.Contents ?? []) {
      if (!item.Key) continue;
      out.push({
        key: item.Key,
        size: item.Size ?? 0,
        lastModified: item.LastModified ?? null,
      });
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return out;
}
