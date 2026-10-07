import { randomBytes } from "node:crypto";
import { createUser } from "../src/lib/auth.ts";
import { userRoles, type UserRole } from "../src/db/schema.ts";

/**
 * Buat akun panel pertama/berikutnya dari terminal.
 * Jalankan:  npx tsx scripts/create-user.mts "Nama" email@domain admin
 * Kata sandi: dari env USER_PASSWORD, atau dibuat acak dan dicetak sekali.
 * Tidak ada kata sandi bawaan di repositori.
 */

const [name, email, roleArg] = process.argv.slice(2);
if (!name || !email) {
  console.error(
    'Pakai: npx tsx scripts/create-user.mts "Nama" email@domain [admin|editor|approver]'
  );
  process.exit(1);
}

const role = (userRoles as readonly string[]).includes(roleArg ?? "")
  ? (roleArg as UserRole)
  : "admin";

const password = process.env.USER_PASSWORD ?? randomBytes(9).toString("base64url");

const user = await createUser({ name, email, password, role });
console.log(`Akun dibuat: ${user.email} (${user.role})`);
if (!process.env.USER_PASSWORD) {
  console.log(`Kata sandi sementara (catat sekarang, tidak ditampilkan lagi): ${password}`);
}
