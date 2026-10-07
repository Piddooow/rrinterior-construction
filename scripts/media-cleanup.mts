import { Pool } from "pg";
import {
  deleteObject,
  headObject,
  listObjectKeys,
  r2Config,
} from "../src/lib/r2.ts";

/**
 * Cleanup object storage (dokumen §8.4.6–8.4.7): idempoten, selalu memeriksa
 * referensi database dan usia sebelum menghapus.
 *
 *  - default: baris `diproses` kedaluwarsa (> 30 menit) → objeknya dihapus
 *    (bila ada) dan baris ditandai `gagal` (upload yang tak pernah finalisasi).
 *  - `--orphans`: object di bucket tanpa referensi baris mana pun dan lebih
 *    tua dari 24 jam → hanya dilaporkan; hapus dengan `--confirm`.
 *
 * Jalankan: npm run db:media-cleanup [-- --orphans --confirm]
 */

const force = process.argv.includes("--force");
const branch = process.env.NEON_BRANCH ?? "";
if (!branch.startsWith("dev") && !force) {
  console.error(
    `Cleanup ditolak: branch "${branch || "(tidak diketahui)"}" bukan dev*. ` +
      "Pakai --force bila sangat yakin."
  );
  process.exit(1);
}
if (!r2Config()) {
  console.error("Environment R2 belum lengkap.");
  process.exit(1);
}
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL (atau DATABASE_URL_UNPOOLED) belum diisi.");
  process.exit(1);
}

const staleMinutes = Number(process.env.CLEANUP_STALE_MINUTES ?? 30);
const orphanHours = Number(process.env.CLEANUP_ORPHAN_HOURS ?? 24);
const withOrphans = process.argv.includes("--orphans");
const confirm = process.argv.includes("--confirm");

const pool = new Pool({ connectionString: url, max: 1 });

// 1) Upload "diproses" yang kedaluwarsa.
const stale = (
  await pool.query<{ id: string; storage_key: string | null }>(
    "SELECT id, storage_key FROM media_assets WHERE upload_status = 'diproses' AND created_at < now() - ($1 || ' minutes')::interval",
    [String(staleMinutes)]
  )
).rows;

let cleaned = 0;
for (const row of stale) {
  if (row.storage_key) {
    const head = await headObject(row.storage_key).catch(() => null);
    if (head) {
      await deleteObject(row.storage_key).catch(() => {});
      console.log(`  objek dihapus (upload kedaluwarsa): ${row.storage_key}`);
    }
  }
  await pool.query(
    "UPDATE media_assets SET upload_status = 'gagal', updated_at = now() WHERE id = $1",
    [row.id]
  );
  cleaned += 1;
}
console.log(
  `Upload kedaluwarsa (> ${staleMinutes} menit): ${cleaned} baris ditandai gagal.`
);

// 2) Object yatim (tanpa referensi DB) — laporan; hapus hanya dengan --confirm.
if (withOrphans) {
  const objects = await listObjectKeys("uploads/");
  const refs = new Set<string>();
  const rows = await pool.query<{ storage_key: string | null; file_url: string }>(
    "SELECT storage_key, file_url FROM media_assets"
  );
  for (const row of rows.rows) {
    if (row.storage_key) refs.add(row.storage_key);
    const idx = row.file_url.indexOf("/uploads/");
    if (idx >= 0) refs.add(row.file_url.slice(idx + 1));
  }

  const cutoff = Date.now() - orphanHours * 3600_000;
  const orphans = objects.filter(
    (object) =>
      !refs.has(object.key) &&
      (!object.lastModified || object.lastModified.getTime() < cutoff)
  );

  console.log(
    `Object yatim (tanpa referensi & > ${orphanHours} jam): ${orphans.length}`
  );
  for (const object of orphans) {
    if (confirm) {
      await deleteObject(object.key);
      console.log(`  dihapus: ${object.key}`);
    } else {
      console.log(`  kandidat (pakai --confirm untuk hapus): ${object.key}`);
    }
  }
}

await pool.end();
console.log("Cleanup selesai.");
