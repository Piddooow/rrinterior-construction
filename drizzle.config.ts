import { defineConfig } from "drizzle-kit";

/**
 * Tooling Drizzle untuk PostgreSQL (Neon). Migrasi aktif di `./drizzle`
 * (dialect postgresql). Riwayat SQLite diarsipkan di `./drizzle-sqlite`
 * dan tidak pernah dicampur di sini.
 *
 * Kredensial: pakai koneksi DIRECT (UNPOOLED) bila tersedia — migrasi dan
 * tooling memerlukan session state; koneksi pooled untuk runtime aplikasi.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
