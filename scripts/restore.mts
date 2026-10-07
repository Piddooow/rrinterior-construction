import { copyFileSync, existsSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import Database from "better-sqlite3";

/**
 * Pulihkan basis data dari berkas cadangan yang dibuat `scripts/backup.mts`.
 *
 * Selalu memverifikasi berkas cadangan lebih dulu (integrity_check), membuat
 * salinan pengaman basis data saat ini (aman WAL), membersihkan sisa
 * `-wal`/`-shm` milik basis data lama, lalu mengganti berkas secara atomik
 * (rename pada folder yang sama) dan memverifikasi hasilnya.
 *
 * PENTING: hentikan server aplikasi sebelum menjalankan pemulihan.
 *
 * Pakai:
 *   node scripts/restore.mts <cadangan.db> [--yes]
 */

function stamp(): string {
  const iso = new Date().toISOString();
  return `${iso.slice(0, 10).replace(/-/g, "")}-${iso
    .slice(11, 19)
    .replace(/:/g, "")}`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const yes = args.includes("--yes");
  const backupArg = args.find((arg) => !arg.startsWith("--"));
  if (!backupArg) {
    throw new Error("Pakai: node scripts/restore.mts <cadangan.db> [--yes]");
  }

  const backupPath = path.resolve(backupArg);
  const dbPath = path.resolve(process.env.DATABASE_URL ?? "./data/rr.db");
  if (!existsSync(backupPath)) {
    throw new Error(`Berkas cadangan tidak ditemukan: ${backupPath}`);
  }

  // 1) Verifikasi cadangan SEBELUM menyentuh apa pun.
  const check = new Database(backupPath, { readonly: true });
  const integrity = check.pragma("integrity_check", { simple: true });
  const projects = (
    check.prepare("select count(*) as n from projects").get() as { n: number }
  ).n;
  check.close();
  if (integrity !== "ok") {
    throw new Error(
      `Cadangan tidak lolos integrity_check (${String(integrity)}) — dibatalkan.`
    );
  }

  console.log(`Cadangan     : ${backupPath}`);
  console.log(`Verifikasi   : integrity_check ok · ${projects} proyek`);
  console.log(`Target       : ${dbPath}`);
  console.log(
    "PENTING      : hentikan server aplikasi sebelum pemulihan agar tidak ada proses yang menulis ke basis data."
  );

  // 2) Konfirmasi (lewati dengan --yes untuk pemakaian otomatis).
  if (!yes) {
    const rl = createInterface({ input: stdin, output: stdout });
    let answer = "";
    try {
      const answered = rl.question("Ketik 'pulihkan' untuk melanjutkan: ");
      const closed = new Promise<string>((resolve) => {
        rl.once("close", () => resolve(""));
      });
      // Bila stdin tertutup (non-interaktif/EOF), perlakukan sebagai batal —
      // tanpa ini proses bisa keluar sendiri dengan kode 0 tanpa aksi apa pun.
      const raw = await Promise.race([answered, closed]);
      answer = String(raw).trim().toLowerCase();
    } catch {
      answer = "";
    }
    rl.close();
    if (answer !== "pulihkan") {
      console.error("Dibatalkan — tidak ada yang diubah.");
      process.exit(1);
    }
  }

  // 3) Salinan pengaman basis data saat ini.
  if (existsSync(dbPath)) {
    const safetyPath = `${dbPath}.pre-restore-${stamp()}`;
    const current = new Database(dbPath);
    try {
      await current.backup(safetyPath);
    } finally {
      current.close();
    }
    console.log(`Salinan aman : ${safetyPath}`);
  } else {
    console.log("Salinan aman : (basis data target belum ada — dilewati)");
  }

  // 4) Ganti berkas: sisa WAL/SHM lama dibuang, lalu rename atomik.
  const tempPath = `${dbPath}.restore-${stamp()}.tmp`;
  copyFileSync(backupPath, tempPath);
  for (const suffix of ["-wal", "-shm"]) {
    if (existsSync(`${dbPath}${suffix}`)) {
      rmSync(`${dbPath}${suffix}`);
      console.log(`Dibersihkan  : ${path.basename(dbPath + suffix)} (milik basis data lama)`);
    }
  }
  renameSync(tempPath, dbPath);

  // 5) Verifikasi hasil pemulihan di tempat.
  const restored = new Database(dbPath, { readonly: true });
  const ok = restored.pragma("integrity_check", { simple: true });
  const count = (
    restored.prepare("select count(*) as n from projects").get() as { n: number }
  ).n;
  restored.close();

  if (ok !== "ok" || count !== projects) {
    throw new Error(
      `Pemulihan tidak terverifikasi (integrity=${String(ok)}, proyek=${count} vs ${projects}). Periksa salinan pengaman.`
    );
  }

  console.log(
    `Pulih ✓      : ${dbPath} (${statSync(dbPath).size} byte, ${count} proyek). Jalankan server kembali.`
  );
}

main().catch((error) => {
  console.error(
    "Gagal memulihkan:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
