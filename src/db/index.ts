import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Koneksi database aplikasi (PostgreSQL/Neon, driver `pg`).
 *
 * - Pool kecil untuk satu instance Node (dokumen arsitektur §5.1.4).
 * - URL runtime memakai koneksi POOLED dari Neon (sslmode=require sudah
 *   ada di connection string sehingga TLS aktif tanpa konfigurasi tambahan).
 * - Lazy: koneksi baru dibuat saat query pertama, bukan saat import —
 *   supaya build/preview tanpa environment tetap aman.
 */

type Db = ReturnType<typeof createClient>;

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum diisi — isi environment server (lihat README)."
    );
  }
  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return drizzle(pool, { schema });
}

const globalForDb = globalThis as unknown as { __rrDb?: Db };

function getClient(): Db {
  if (!globalForDb.__rrDb) globalForDb.__rrDb = createClient();
  return globalForDb.__rrDb;
}

/** Satu pool dipakai ulang (aman untuk HMR dev); akses lazy via proxy. */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const client = getClient() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
