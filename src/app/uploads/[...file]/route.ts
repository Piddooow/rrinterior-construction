import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { isR2Configured } from "@/lib/r2";

/**
 * Penyaji berkas unggahan runtime.
 *
 * `next start` hanya menyajikan berkas `public/` yang ada saat build, sehingga
 * unggahan baru akan 404 sampai proses di-restart. Route Handler ini membaca
 * langsung dari folder unggahan untuk URL `/uploads/<nama>` sehingga media
 * baru langsung tersedia tanpa restart — dan tetap kompatibel bila berkas
 * kebetulan ikut tersalin ke public saat build.
 *
 * Nama berkas dibuat server (UUID + ekstensi); hanya pola itu yang dilayani
 * agar tidak ada pembacaan berkas lain di luar folder unggahan.
 */

const UPLOAD_DIR = () =>
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
};

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const { file } = await params;
  const name = file.join("/");

  // Hanya berkas datar hasil unggahan (uuid + ekstensi yang didukung).
  const match = /^[A-Za-z0-9-]+\.(jpg|jpeg|png|webp|mp4)$/.exec(name);
  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  // Setelah migrasi R2, URL lama diarahkan permanen ke object storage
  // (dokumen §8.5.5). Selama belum dimigrasi, berkas lokal tetap dilayani.
  if (isR2Configured()) {
    const migrated = await db
      .select({ fileUrl: mediaAssets.fileUrl })
      .from(mediaAssets)
      .where(eq(mediaAssets.storageKey, `uploads/${name}`))
      .limit(1);
    const target = migrated[0]?.fileUrl;
    if (target && target.startsWith("http")) {
      return Response.redirect(target, 301);
    }
  }

  const dir = path.resolve(UPLOAD_DIR());
  // Pertahanan berlapis: selain pola nama, pastikan hasil resolve tetap di
  // dalam folder unggahan (tidak mungkin keluar lewat path apa pun).
  const filePath = path.resolve(dir, name);
  if (!filePath.startsWith(dir + path.sep)) {
    return new Response("Not found", { status: 404 });
  }
  const info = await stat(filePath).catch(() => null);
  if (!info?.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const extension = match[1].toLowerCase();
  const stream = Readable.toWeb(
    createReadStream(filePath)
  ) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    headers: {
      "Content-Type": MIME_BY_EXT[extension] ?? "application/octet-stream",
      "Content-Length": String(info.size),
      // Berkas unggahan tidak pernah boleh "ditebak" jenisnya oleh peramban.
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-site",
      "Content-Disposition": `inline; filename="${name}"`,
      // Nama berkas memuat UUID → isi tidak pernah berubah.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
