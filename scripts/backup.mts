import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

/**
 * Cadangan basis data SQLite (aman saat server menulis / mode WAL) plus arsip
 * berkas unggahan. Snapshot dibuat lewat API backup online better-sqlite3 —
 * menyalin berkas .db mentah tidak aman karena ada `-wal` yang belum
 * ter-checkpoint. Setiap cadangan diverifikasi (integrity_check + hitungan)
 * sebelum dinyatakan sukses.
 *
 * Pakai:
 *   node scripts/backup.mts [--keep N] [--out DIR] [--db-only]
 *
 * Sumber konfigurasi (sama dengan aplikasi):
 *   DATABASE_URL — jalur basis data (bawaan ./data/rr.db)
 *   UPLOAD_DIR   — folder unggahan  (bawaan ./public/uploads)
 *   BACKUP_DIR   — folder cadangan  (bawaan ./backups)
 */

type Options = {
  keep: number;
  dbOnly: boolean;
  outDir: string;
};

function parseArgs(argv: string[]): Options {
  let keep = Number(process.env.BACKUP_KEEP ?? 14);
  let dbOnly = false;
  let outDir = process.env.BACKUP_DIR ?? "backups";
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--keep") {
      keep = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--db-only") {
      dbOnly = true;
    } else if (arg === "--out") {
      outDir = argv[i + 1] ?? outDir;
      i += 1;
    } else {
      throw new Error(`Argumen tidak dikenal: ${arg}`);
    }
  }
  if (!Number.isInteger(keep) || keep < 1) {
    throw new Error("--keep harus bilangan bulat >= 1.");
  }
  return { keep, dbOnly, outDir };
}

function stamp(): string {
  const iso = new Date().toISOString();
  return `${iso.slice(0, 10).replace(/-/g, "")}-${iso
    .slice(11, 19)
    .replace(/:/g, "")}`;
}

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function prune(dir: string, pattern: RegExp, keep: number): void {
  const files = readdirSync(dir)
    .filter((file) => pattern.test(file))
    .sort();
  const excess = files.slice(0, Math.max(0, files.length - keep));
  for (const file of excess) {
    rmSync(path.join(dir, file));
  }
  if (excess.length > 0) {
    console.log(`Dihapus      : ${excess.length} cadangan lama.`);
  }
}

async function main(): Promise<void> {
  const { keep, dbOnly, outDir } = parseArgs(process.argv.slice(2));
  const dbPath = path.resolve(process.env.DATABASE_URL ?? "./data/rr.db");
  const backupDir = path.resolve(outDir);

  if (!existsSync(dbPath)) {
    throw new Error(`Basis data tidak ditemukan: ${dbPath}`);
  }
  mkdirSync(backupDir, { recursive: true });

  const ts = stamp();
  const dbDest = path.join(backupDir, `rr-${ts}.db`);

  // 1) Snapshot konsisten lewat API backup online.
  const source = new Database(dbPath);
  try {
    if (existsSync(dbDest)) rmSync(dbDest);
    await source.backup(dbDest);
  } finally {
    source.close();
  }

  // 2) Verifikasi hasil cadangan — cadangan tanpa verifikasi tidak dihitung.
  const copy = new Database(dbDest, { readonly: true });
  const integrity = copy.pragma("integrity_check", { simple: true });
  const projects = copy
    .prepare("select count(*) as n from projects")
    .get() as { n: number };
  const settings = copy
    .prepare("select count(*) as n from site_settings")
    .get() as { n: number };
  copy.close();

  if (integrity !== "ok") {
    throw new Error(
      `Cadangan gagal diverifikasi (integrity_check: ${String(integrity)}).`
    );
  }

  console.log(`Cadangan DB  : ${dbDest} (${formatBytes(statSync(dbDest).size)})`);
  console.log(
    `Verifikasi   : integrity_check ok · ${projects.n} proyek · ${settings.n} pengaturan`
  );

  // 3) Arsip berkas unggahan (media runtime).
  if (!dbOnly) {
    const uploadsDir = path.resolve(process.env.UPLOAD_DIR ?? "public/uploads");
    if (existsSync(uploadsDir) && readdirSync(uploadsDir).length > 0) {
      const uploadsDest = path.join(backupDir, `uploads-${ts}.tar.gz`);
      execFileSync("tar", ["-czf", uploadsDest, "-C", uploadsDir, "."]);
      console.log(
        `Cadangan media: ${uploadsDest} (${formatBytes(statSync(uploadsDest).size)})`
      );
    } else {
      console.log(
        "Cadangan media: dilewati (folder unggahan kosong atau tidak ada)."
      );
    }
  }

  // 4) Retensi: simpan hanya N cadangan terbaru (nama memuat waktu → urut).
  prune(backupDir, /^rr-.*\.db$/, keep);
  prune(backupDir, /^uploads-.*\.tar\.gz$/, keep);
  console.log(`Retensi      : menyimpan ${keep} cadangan terbaru di ${backupDir}`);
}

main().catch((error) => {
  console.error(
    "Gagal mencadangkan:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
