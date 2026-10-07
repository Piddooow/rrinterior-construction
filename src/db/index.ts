import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type Db = ReturnType<typeof createClient>;

function createClient() {
  mkdirSync("data", { recursive: true });
  const sqlite = new Database(process.env.DATABASE_URL ?? "./data/rr.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

const globalForDb = globalThis as unknown as { __rrDb?: Db };

/** Satu koneksi dipakai ulang saat dev (hindari koneksi ganda saat HMR). */
export const db = globalForDb.__rrDb ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.__rrDb = db;
