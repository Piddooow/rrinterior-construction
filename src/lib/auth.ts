import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions,
  users,
  userRoles,
  type User,
  type UserRole,
} from "@/db/schema";

/**
 * Autentikasi & sesi panel admin (server-only).
 * - Kata sandi: scrypt bersalt, verifikasi waktu-tetap.
 * - Token sesi: acak 32 byte; yang disimpan hanya hash sha256-nya.
 * - Peran: admin / editor / approver (kebijakan final menunggu D04).
 * Pemaksaan izin harus di server (bukan sekadar menyembunyikan tombol).
 */

const scrypt = promisify(scryptCallback);
const SCRYPT_KEYLEN = 64;
const SESSION_DAYS = 7;
const PASSWORD_MIN = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Pengguna aman (tanpa hash kata sandi) untuk sesi & tampilan. */
export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/** Kapabilitas per peran; kebijakan final menunggu keputusan D04. */
export const ROLE_CAPABILITIES: Record<
  UserRole,
  { publish: boolean; manageUsers: boolean }
> = {
  admin: { publish: true, manageUsers: true },
  editor: { publish: false, manageUsers: false },
  approver: { publish: true, manageUsers: false },
};

export function can(
  role: UserRole,
  capability: "publish" | "manageUsers"
): boolean {
  return ROLE_CAPABILITIES[role][capability];
}

/** Hash scrypt bersalt dengan format "scrypt$<saltHex>$<hashHex>". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Verifikasi kata sandi dengan perbandingan waktu-tetap. */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const derived = (await scrypt(
    password,
    Buffer.from(saltHex, "hex"),
    SCRYPT_KEYLEN
  )) as Buffer;
  const expected = Buffer.from(hashHex, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

/** Buat akun panel baru (kata sandi minimal 8 karakter; email unik). */
export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) throw new Error("Nama pengguna wajib diisi.");
  if (!EMAIL_PATTERN.test(email)) throw new Error("Alamat email tidak valid.");
  if (input.password.length < PASSWORD_MIN) {
    throw new Error(`Kata sandi minimal ${PASSWORD_MIN} karakter.`);
  }
  if (!userRoles.includes(input.role)) {
    throw new Error("Peran tidak dikenal.");
  }

  const taken = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (taken.length > 0) {
    throw new Error(`Email ${email} sudah terdaftar.`);
  }

  const [row] = await db
    .insert(users)
    .values({
      id: `user-${randomUUID()}`,
      name,
      email,
      role: input.role,
      passwordHash: await hashPassword(input.password),
    })
    .returning();
  return toSafeUser(row);
}

/** Hash pembanding saat email tidak ditemukan (menyamakan waktu respons). */
let timingDummyHash: Promise<string> | null = null;

/** Cocokkan email + kata sandi; null bila gagal (tanpa membedakan sebab). */
export async function authenticate(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  const user = rows[0] ?? null;
  const stored =
    user?.passwordHash ??
    (timingDummyHash ??= hashPassword("timing-pembanding-tanpa-akun"));

  const ok = await verifyPassword(password, await stored);
  return user && ok ? toSafeUser(user) : null;
}

/**
 * Ganti kata sandi akun (R5) — untuk fitur "Keamanan akun" di Pengaturan.
 * Memverifikasi kata sandi saat ini lebih dulu, menolak sandi baru yang
 * terlalu pendek atau sama dengan yang lama, lalu menyimpan hash baru.
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const user = rows[0];
  if (!user) throw new Error("Akun tidak ditemukan.");
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw new Error("Kata sandi saat ini tidak cocok.");
  if (newPassword.length < PASSWORD_MIN) {
    throw new Error(`Kata sandi baru minimal ${PASSWORD_MIN} karakter.`);
  }
  if (newPassword === currentPassword) {
    throw new Error("Kata sandi baru harus berbeda dari yang sekarang.");
  }
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(users.id, userId));
}

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** Buat sesi baru; mengembalikan token mentah (hanya hash yang disimpan). */
export async function createSession(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    id: `sess-${randomUUID()}`,
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  return { token, expiresAt };
}

/** Pengguna dari token sesi; kedaluwarsa/tidak dikenal → null (dibersihkan). */
export async function getSessionUser(token: string): Promise<SafeUser | null> {
  if (!token) return null;
  const rows = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, hashToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await destroySession(token);
    return null;
  }
  return toSafeUser(row.user);
}

/** Akhiri satu sesi (keluar). */
export async function destroySession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

/** Bersihkan sesi kedaluwarsa; mengembalikan jumlah baris terhapus. */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  return result.rowCount ?? 0;
}
