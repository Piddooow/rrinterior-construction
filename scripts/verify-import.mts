import { createHash } from "node:crypto";
import Database from "better-sqlite3";
import { Pool } from "pg";

/**
 * Verifikasi impor SQLite → PostgreSQL.
 *
 * 1. Count per tabel (SQLite vs PostgreSQL) harus sama.
 * 2. Digest ternormalisasi (waktu → ISO, boolean → boolean, JSON → kunci
 *    terurut) per tabel harus identik — pembanding data menyeluruh, bukan
 *    sekadar jumlah baris.
 * 3. Cek relasi (orphan FK) di PostgreSQL harus nol.
 *
 * `sessions` sengaja tidak dibandingkan (tidak ikut migrasi — login ulang).
 * Jalankan: npm run db:verify
 */

type ColumnType = "text" | "int" | "bool" | "ts" | "json";

const TABLES: { name: string; columns: { col: string; type: ColumnType }[] }[] =
  [
    { name: "users", columns: [
      { col: "id", type: "text" }, { col: "name", type: "text" },
      { col: "email", type: "text" }, { col: "password_hash", type: "text" },
      { col: "role", type: "text" }, { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" },
    ] },
    { name: "services", columns: [
      { col: "id", type: "text" }, { col: "slug", type: "text" },
      { col: "title_id", type: "text" }, { col: "title_en", type: "text" },
      { col: "description_id", type: "text" }, { col: "description_en", type: "text" },
      { col: "sort_order", type: "int" }, { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" }, { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" }, { col: "deleted_at", type: "ts" },
    ] },
    { name: "process_steps", columns: [
      { col: "id", type: "text" }, { col: "title_id", type: "text" },
      { col: "title_en", type: "text" }, { col: "description_id", type: "text" },
      { col: "description_en", type: "text" }, { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" }, { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" }, { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ] },
    { name: "site_settings", columns: [
      { col: "id", type: "text" }, { col: "key", type: "text" },
      { col: "value_id", type: "text" }, { col: "value_en", type: "text" },
      { col: "group", type: "text" }, { col: "updated_by", type: "text" },
      { col: "updated_at", type: "ts" },
    ] },
    { name: "projects", columns: [
      { col: "id", type: "text" }, { col: "slug", type: "text" },
      { col: "title_id", type: "text" }, { col: "title_en", type: "text" },
      { col: "summary_id", type: "text" }, { col: "summary_en", type: "text" },
      { col: "scope_of_work_id", type: "text" }, { col: "scope_of_work_en", type: "text" },
      { col: "room_type", type: "text" }, { col: "general_location", type: "text" },
      { col: "source_post", type: "text" }, { col: "project_status", type: "text" },
      { col: "year_completed", type: "int" }, { col: "cover_url", type: "text" },
      { col: "cover_role", type: "text" }, { col: "cover_alt_id", type: "text" },
      { col: "cover_alt_en", type: "text" }, { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" }, { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" }, { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ] },
    { name: "media_assets", columns: [
      { col: "id", type: "text" }, { col: "media_type", type: "text" },
      { col: "media_role", type: "text" }, { col: "file_url", type: "text" },
      { col: "thumbnail_url", type: "text" }, { col: "name", type: "text" },
      { col: "alt_text_id", type: "text" }, { col: "alt_text_en", type: "text" },
      { col: "caption_id", type: "text" }, { col: "caption_en", type: "text" },
      { col: "credit", type: "text" }, { col: "consent_confirmed", type: "bool" },
      { col: "mime_type", type: "text" }, { col: "file_size", type: "int" },
      { col: "upload_status", type: "text" }, { col: "uploaded_by", type: "text" },
      { col: "created_at", type: "ts" }, { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ] },
    { name: "project_media", columns: [
      { col: "id", type: "text" }, { col: "project_id", type: "text" },
      { col: "media_id", type: "text" }, { col: "section", type: "text" },
      { col: "sort_order", type: "int" }, { col: "created_at", type: "ts" },
    ] },
    { name: "testimonials", columns: [
      { col: "id", type: "text" }, { col: "client_display_name", type: "text" },
      { col: "quote_id", type: "text" }, { col: "quote_en", type: "text" },
      { col: "project_id", type: "text" }, { col: "source", type: "text" },
      { col: "permission_confirmed", type: "bool" }, { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" }, { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" }, { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ] },
    { name: "faqs", columns: [
      { col: "id", type: "text" }, { col: "question_id", type: "text" },
      { col: "question_en", type: "text" }, { col: "answer_id", type: "text" },
      { col: "answer_en", type: "text" }, { col: "sort_order", type: "int" },
      { col: "content_status", type: "text" }, { col: "published_at", type: "ts" },
      { col: "created_at", type: "ts" }, { col: "updated_at", type: "ts" },
      { col: "deleted_at", type: "ts" },
    ] },
    { name: "static_pages", columns: [
      { col: "id", type: "text" }, { col: "slug", type: "text" },
      { col: "title_id", type: "text" }, { col: "title_en", type: "text" },
      { col: "body_id", type: "text" }, { col: "body_en", type: "text" },
      { col: "sort_order", type: "int" }, { col: "content_status", type: "text" },
      { col: "published_at", type: "ts" }, { col: "created_at", type: "ts" },
      { col: "updated_at", type: "ts" }, { col: "deleted_at", type: "ts" },
    ] },
    { name: "content_revisions", columns: [
      { col: "id", type: "text" }, { col: "entity_type", type: "text" },
      { col: "entity_id", type: "text" }, { col: "snapshot", type: "json" },
      { col: "status", type: "text" }, { col: "created_by", type: "text" },
      { col: "created_at", type: "ts" },
    ] },
  ];

const sqliteUrl = process.env.SQLITE_PATH ?? "./data/rr.db";
const pgUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!pgUrl) {
  console.error("DATABASE_URL (atau DATABASE_URL_UNPOOLED) belum diisi.");
  process.exit(1);
}

/** JSON kanonik: kunci diurut rekursif supaya jsonb vs teks sebanding. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)])
    );
  }
  return value;
}

function normalizeRow(
  row: Record<string, unknown>,
  columns: { col: string; type: ColumnType }[],
  side: "sqlite" | "pg"
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const { col, type } of columns) {
    const value = row[col];
    if (value === null || value === undefined) {
      out[col] = null;
    } else if (type === "ts") {
      out[col] =
        side === "sqlite"
          ? new Date((value as number) * 1000).toISOString()
          : (value as Date).toISOString();
    } else if (type === "bool") {
      out[col] = side === "sqlite" ? value === 1 || value === true : value === true;
    } else if (type === "json") {
      out[col] = canonical(
        side === "sqlite" ? JSON.parse(String(value)) : value
      );
    } else {
      out[col] = value;
    }
  }
  return out;
}

const digest = (rows: Record<string, unknown>[]) =>
  createHash("sha256")
    .update(JSON.stringify(rows))
    .digest("hex")
    .slice(0, 16);

const sqlite = new Database(sqliteUrl, { readonly: true });
const pool = new Pool({ connectionString: pgUrl, max: 1 });

let failures = 0;
for (const table of TABLES) {
  const sqliteRows = (
    sqlite.prepare(`SELECT * FROM ${table.name}`).all() as Record<string, unknown>[]
  )
    .map((r) => normalizeRow(r, table.columns, "sqlite"))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const pgRows = (
    (await pool.query(`SELECT * FROM ${table.name}`)).rows as Record<string, unknown>[]
  )
    .map((r) => normalizeRow(r, table.columns, "pg"))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const countOk = sqliteRows.length === pgRows.length;
  const digestOk = countOk && digest(sqliteRows) === digest(pgRows);
  if (!countOk || !digestOk) failures += 1;
  console.log(
    `${countOk && digestOk ? "OK  " : "FAIL"} ${table.name}: sqlite=${sqliteRows.length} pg=${pgRows.length} digest=${digestOk ? "sama" : "beda"}`
  );
}

/** Cek relasi (orphan) di PostgreSQL. */
const orphans = [
  {
    label: "project_media → projects",
    sql: "SELECT COUNT(*)::int AS n FROM project_media pm LEFT JOIN projects p ON p.id = pm.project_id WHERE p.id IS NULL",
  },
  {
    label: "project_media → media_assets",
    sql: "SELECT COUNT(*)::int AS n FROM project_media pm LEFT JOIN media_assets m ON m.id = pm.media_id WHERE m.id IS NULL",
  },
  {
    label: "testimonials → projects",
    sql: "SELECT COUNT(*)::int AS n FROM testimonials t LEFT JOIN projects p ON p.id = t.project_id WHERE t.project_id IS NOT NULL AND p.id IS NULL",
  },
];
for (const check of orphans) {
  const { n } = (await pool.query<{ n: number }>(check.sql)).rows[0]!;
  if (n !== 0) failures += 1;
  console.log(`${n === 0 ? "OK  " : "FAIL"} relasi ${check.label}: ${n} orphan`);
}

const sessions = (await pool.query<{ n: number }>(
  "SELECT COUNT(*)::int AS n FROM sessions"
)).rows[0]!;
console.log(
  `INFO sessions di PostgreSQL: ${sessions.n} (sengaja tidak dimigrasi — login ulang)`
);

await pool.end();
sqlite.close();

if (failures > 0) {
  console.error(`Verifikasi GAGAL: ${failures} pemeriksaan tidak cocok.`);
  process.exit(1);
}
console.log("Verifikasi impor LOLOS — data identik & relasi bersih.");
