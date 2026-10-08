import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import {
  headObject,
  putObject,
  readObjectAll,
  r2Config,
  r2PublicUrl,
} from "../src/lib/r2.ts";

/**
 * Migrasi media dinamis lama (`public/uploads/*`) ke Cloudflare R2
 * (dokumen §8.5): salin ke key unik → verifikasi existence + ukuran +
 * checksum sha256 → perbarui SEMUA referensi aktif (pustaka media +
 * cover proyek) lewat mapping yang tercetak. Idempoten: aman diulang.
 * Berkas sumber TIDAK dihapus (retensi sampai verifikasi disetujui).
 *
 * Jalankan: npm run db:migrate-media (butuh environment R2 + DATABASE_URL)
 */

const force = process.argv.includes("--force");
const branch = process.env.NEON_BRANCH ?? "";
if (!branch.startsWith("dev") && !force) {
  console.error(
    `Migrasi media ditolak: branch "${branch || "(tidak diketahui)"}" bukan dev*. ` +
      "Pakai --force bila sangat yakin."
  );
  process.exit(1);
}
if (!r2Config()) {
  console.error("Environment R2 belum lengkap (lihat npm run r2:setup).");
  process.exit(1);
}
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL (atau DATABASE_URL_UNPOOLED) belum diisi.");
  process.exit(1);
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
};

const uploadDir =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
const pool = new Pool({ connectionString: url, max: 1 });

/**
 * Perbarui semua referensi aktif dari path lokal lama ke URL publik R2
 * (§8.5.3): pustaka media (file + thumbnail) dan cover proyek. Snapshot
 * revisi historis tidak disentuh (append-only). `updated_at` proyek tidak
 * diubah agar sinyal sitemap tidak ikut bergeser oleh migrasi storage.
 */
async function updateReferences(oldPath: string, newUrl: string, key: string) {
  await pool.query(
    "UPDATE media_assets SET storage_key = $1, file_url = $2, updated_at = now() WHERE file_url = $3",
    [key, newUrl, oldPath]
  );
  await pool.query(
    "UPDATE media_assets SET thumbnail_url = $1 WHERE thumbnail_url = $2",
    [newUrl, oldPath]
  );
  await pool.query("UPDATE projects SET cover_url = $1 WHERE cover_url = $2", [
    newUrl,
    oldPath,
  ]);
}

// Kumpulkan nama berkas dari SEMUA referensi aktif yang masih lokal.
const mediaRows = (
  await pool.query<{ file_url: string }>(
    "SELECT file_url FROM media_assets WHERE file_url LIKE '/uploads/%'"
  )
).rows;
const coverRows = (
  await pool.query<{ cover_url: string }>(
    "SELECT cover_url FROM projects WHERE cover_url LIKE '/uploads/%'"
  )
).rows;

const names = new Set<string>();
for (const row of mediaRows) names.add(path.basename(row.file_url));
for (const row of coverRows) names.add(path.basename(row.cover_url));

if (names.size === 0) {
  console.log("Tidak ada referensi lokal `/uploads/*` untuk dimigrasi.");
  await pool.end();
  process.exit(0);
}

let migrated = 0;
let verified = 0;
let failed = 0;

for (const name of [...names].sort()) {
  const oldPath = `/uploads/${name}`;
  const key = `uploads/${name}`;
  try {
    const bytes = await readFile(path.join(uploadDir, name));
    const localSha = createHash("sha256").update(bytes).digest("hex");
    const existing = await headObject(key);

    if (existing && existing.size === bytes.byteLength) {
      const remote = await readObjectAll(key);
      const remoteSha = remote
        ? createHash("sha256").update(remote).digest("hex")
        : "";
      if (remoteSha === localSha) {
        await updateReferences(oldPath, r2PublicUrl(key), key);
        verified += 1;
        console.log(`  sudah ada & cocok: ${name} → ${key} (referensi dirapikan)`);
        continue;
      }
      console.log(
        `  PERINGATAN: object ${key} ada tetapi isinya berbeda — ditimpa dari sumber lokal.`
      );
    }

    const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
    await putObject(
      key,
      bytes,
      MIME_BY_EXT[extension] ?? "application/octet-stream"
    );

    const after = await headObject(key);
    if (!after || after.size !== bytes.byteLength) {
      throw new Error("ukuran objek tidak cocok setelah upload");
    }
    const remote = await readObjectAll(key);
    const remoteSha = remote
      ? createHash("sha256").update(remote).digest("hex")
      : "";
    if (remoteSha !== localSha) {
      throw new Error("checksum objek tidak cocok dengan sumber");
    }

    await updateReferences(oldPath, r2PublicUrl(key), key);
    migrated += 1;
    console.log(
      `  OK ${name} → ${key} (${bytes.byteLength} byte, sha256 ${localSha.slice(0, 12)}…)`
    );
  } catch (error) {
    failed += 1;
    console.error(
      `  GAGAL ${name}: ${error instanceof Error ? error.message : error}`
    );
  }
}

await pool.end();
console.log(
  `Migrasi media selesai: ${migrated} disalin, ${verified} sudah ada & terverifikasi, ${failed} gagal.`
);
if (failed > 0) process.exit(1);
