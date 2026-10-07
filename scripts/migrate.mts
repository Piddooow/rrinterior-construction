import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

/**
 * Migrasi PostgreSQL (Neon) — langkah rilis terkontrol, bukan bagian build.
 * Pakai koneksi DIRECT (UNPOOLED) bila tersedia: migrasi memerlukan
 * session state. Jalankan: npm run db:migrate
 */

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL (atau DATABASE_URL_UNPOOLED) belum diisi.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("Migrasi PostgreSQL selesai.");
} finally {
  await pool.end();
}
