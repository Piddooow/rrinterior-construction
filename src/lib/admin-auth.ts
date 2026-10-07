import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  cleanupExpiredSessions,
  createSession,
  destroySession,
  getSessionUser,
  type SafeUser,
} from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-constants";

/**
 * Jembatan sesi panel ↔ HTTP. Cookie httpOnly menyimpan token mentah;
 * database hanya menyimpan hash-nya (lihat `auth.ts`). Proxy melakukan cek
 * optimistis (ada/tidak cookie) untuk redirect cepat, sedangkan verifikasi
 * sesungguhnya ada di sini — sedekat mungkin dengan data, sesuai panduan
 * autentikasi Next.
 */

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  // Localhost http tetap boleh; produksi wajib https.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  expires,
});

/** Pengguna dari cookie sesi saat ini; null bila tidak ada/tidak valid. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSessionUser(token);
}

/** Penjaga DAL halaman panel: tanpa sesi valid → halaman masuk. */
export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/**
 * Buat sesi baru + pasang cookie. Sesi lama pada peramban yang sama dimatikan
 * lebih dulu (rotasi token saat login). Pembersihan baris kedaluwarsa
 * dijalankan tanpa menahan login.
 */
export async function startSession(userId: string): Promise<void> {
  const store = await cookies();
  const previous = store.get(SESSION_COOKIE)?.value;
  if (previous) await destroySession(previous);

  const { token, expiresAt } = await createSession(userId);
  store.set(SESSION_COOKIE, token, cookieOptions(expiresAt));

  void cleanupExpiredSessions().catch(() => {});
}

/** Akhiri sesi (keluar): hapus baris di database + cookie peramban. */
export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);
  store.delete(SESSION_COOKIE);
}
