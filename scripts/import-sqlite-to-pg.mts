import Database from "better-sqlite3";
import { Pool } from "pg";

/**
 * Importer SQLite → PostgreSQL (Neon) untuk migrasi terkontrol.
 *
 * - Menyalin baris apa adanya dengan ID & relasi yang dipertahankan.
 * - Transformasi: unixepoch (detik) → timestamptz · 0/1 → boolean ·
 *   JSON teks → jsonb.
 * - Idempoten: INSERT ... ON CONFLICT (id) DO NOTHING (aman diulang).
 * - `--reset` membersihkan tabel konten lebih dulu — HANYA untuk target
 *   rehearsal (branch dev). Ditolak bila NEON_BRANCH bukan dev* kecuali
 *   memakai --force.
 * - Tabel `sessions` sengaja TIDAK disalin (keputusan pemilik: login ulang).
 *
 * Jalankan: npm run db:import [-- --reset]
 */

type ColumnType = "text" | "int" | "bool" | "ts" | "json";

const TABLES: {
  name: string;
  columns: { col: string; type: ColumnType }[];
}[] = [
  {
    name: "users",
    columns: [
      { col: "id", type: "text" },
      { col: "name", type: "text" },
      { col: "email", type: "text" },
      { col: "password_hash", type: "text" },
      { col: "role", type: "text" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
    ],
  },
  {
    name: "services",
    columns: [
      { col: "id", type: "text" },
      { col: "slug", type: "text" },
      { col: "title_id", type: "text" },
      { col: "title_en", type: "text" },
      { col: "description_id", type: "text" },
      { col: "description_en", type: "text" },
      { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ],
  },
  {
    name: "process_steps",
    columns: [
      { col: "id", type: "text" },
      { col: "title_id", type: "text" },
      { col: "title_en", type: "text" },
      { col: "description_id", type: "text" },
      { col: "description_en", type: "text" },
      { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ],
  },
  {
    name: "site_settings",
    columns: [
      { col: "id", type: "text" },
      { col: "key", type: "text" },
      { col: "value_id", type: "text" },
      { col: "value_en", type: "text" },
      { col: "group", type: "text" },
      { col: "updated_by", type: "text" },
      { col: "updated_at", type: "ts" },
    ],
  },
  {
    name: "projects",
    columns: [
      { col: "id", type: "text" },
      { col: "slug", type: "text" },
      { col: "title_id", type: "text" },
      { col: "title_en", type: "text" },
      { col: "summary_id", type: "text" },
      { col: "summary_en", type: "text" },
      { col: "scope_of_work_id", type: "text" },
      { col: "scope_of_work_en", type: "text" },
      { col: "room_type", type: "text" },
      { col: "general_location", type: "text" },
      { col: "source_post", type: "text" },
      { col: "project_status", type: "text" },
      { col: "year_completed", type: "int" },
      { col: "cover_url", type: "text" },
      { col: "cover_role", type: "text" },
      { col: "cover_alt_id", type: "text" },
      { col: "cover_alt_en", type: "text" },
      { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ],
  },
  {
    name: "media_assets",
    columns: [
      { col: "id", type: "text" },
      { col: "media_type", type: "text" },
      { col: "media_role", type: "text" },
      { col: "file_url", type: "text" },
      { col: "thumbnail_url", type: "text" },
      { col: "name", type: "text" },
      { col: "alt_text_id", type: "text" },
      { col: "alt_text_en", type: "text" },
      { col: "caption_id", type: "text" },
      { col: "caption_en", type: "text" },
      { col: "credit", type: "text" },
      { col: "consent_confirmed", type: "bool" },
      { col: "mime_type", type: "text" },
      { col: "file_size", type: "int" },
      { col: "upload_status", type: "text" },
      { col: "uploaded_by", type: "text" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ],
  },
  {
    name: "project_media",
    columns: [
      { col: "id", type: "text" },
      { col: "project_id", type: "text" },
      { col: "media_id", type: "text" },
      { col: "section", type: "text" },
      { col: "sort_order", type: "int" },
      { col: "created_at", type: "ts" },
    ],
  },
  {
    name: "testimonials",
    columns: [
      { col: "id", type: "text" },
      { col: "client_display_name", type: "text" },
      { col: "quote_id", type: "text" },
      { col: "quote_en", type: "text" },
      { col: "project_id", type: "text" },
      { col: "source", type: "text" },
      { col: "permission_confirmed", type: "bool" },
      { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ],
  },
  {
    name: "faqs",
    columns: [
      { col: "id", type: "text" },
      { col: "question_id", type: "text" },
      { col: "question_en", type: "text" },
      { col: "answer_id", type: "text" },
      { col: "answer_en", type: "text" },
      { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ],
  },
  {
    name: "static_pages",
    columns: [
      { col: "id", type: "text" },
      { col: "slug", type: "text" },
      { col: "title_id", type: "text" },
      { col: "title_en", type: "text" },
      { col: "body_id", type: "text" },
      { col: "body_en", type: "text" },
      { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ],
  },
  {
    name: "content_revisions",
    columns: [
      { col: "id", type: "text" },
      { col: "entity_type", type: "text" },
      { col: "entity_id", type: "text" },
      { col: "snapshot", type: "json" },
      { col: "status", type: "text" },
      { col: "created_by", type: "text" },
      { col: "created_at", type: "ts" },
    ],
  },
];

const reset = process.argv.includes("--reset");
const force = process.argv.includes("--force");
const branch = process.env.NEON_BRANCH ?? "";
if (reset && !branch.startsWith("dev") && !force) {
  console.error(
    `--reset ditolak: branch target "${branch || "(tidak diketahui)"}" bukan dev*. ` +
      "Reset hanya untuk target rehearsal; pakai --force bila sangat yakin."
  );
  process.exit(1);
}

const sqliteUrl = process.env.SQLITE_PATH ?? "./data/rr.db";
const pgUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!pgUrl) {
  console.error("DATABASE_URL (atau DATABASE_URL_UNPOOLED) belum diisi.");
  process.exit(1);
}

const sqlite = new Database(sqliteUrl, { readonly: true });
const pool = new Pool({ connectionString: pgUrl, max: 1 });
const client = await pool.connect();

const transform = (value: unknown, type: ColumnType): unknown => {
  if (value === null || value === undefined) return null;
  if (type === "ts") return new Date((value as number) * 1000);
  if (type === "bool") return value === 1 || value === true;
  if (type === "json") return JSON.parse(String(value));
  return value;
};

try {
  await client.query("BEGIN");
  if (reset) {
    const names = TABLES.map((t) => `"${t.name}"`).join(", ");
    await client.query(`TRUNCATE ${names} CASCADE`);
    console.log("Reset: tabel konten dikosongkan (rehearsal).");
  }

  let total = 0;
  for (const table of TABLES) {
    const rows = sqlite
      .prepare(`SELECT * FROM ${table.name}`)
      .all() as Record<string, unknown>[];
    const cols = table.columns.map((c) => `"${c.col}"`).join(", ");
    const placeholders = table.columns
      .map((_, i) => `$${i + 1}`)
      .join(", ");
    let inserted = 0;
    for (const row of rows) {
      const values = table.columns.map((c) => transform(row[c.col], c.type));
      const result = await client.query(
        `INSERT INTO ${table.name} (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
        values
      );
      inserted += result.rowCount ?? 0;
    }
    total += inserted;
    console.log(
      `  ${table.name}: ${rows.length} baris dibaca, ${inserted} baru dimasukkan`
    );
  }
  await client.query("COMMIT");
  console.log(`Import selesai — total ${total} baris baru.`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Import gagal (rollback):", (error as Error).message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
  sqlite.close();
}
