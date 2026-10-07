import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

mkdirSync("data", { recursive: true });
const sqlite = new Database(process.env.DATABASE_URL ?? "./data/rr.db");
migrate(drizzle(sqlite), { migrationsFolder: "./drizzle" });
sqlite.close();
console.log("Migrasi database selesai.");
