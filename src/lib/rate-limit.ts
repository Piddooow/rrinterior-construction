/**
 * Pembatas percobaan masuk (rate limit) panel admin — in-memory, tanpa
 * dependency baru (R5).
 *
 * Aturan:
 * - Per kombinasi IP + email: maksimum 5 kegagalan dalam jendela 15 menit.
 * - Per IP: maksimum 25 kegagalan dalam jendela yang sama (mencegah
 *   penyemprotan banyak email dari satu alamat).
 * - Login berhasil membersihkan hitungan kombinasi tersebut.
 *
 * Catatan skala: hitungan hidup di memori satu proses — cukup untuk satu
 * node (kondisi saat ini). Bila kelak jalan multi-instance, ganti penyimpanan
 * ke tabel/Redis tanpa mengubah antarmuka fungsi di bawah.
 */

type Entry = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const PER_ACCOUNT = 5;
const PER_IP = 25;
const MAX_ENTRIES = 2000;

const buckets = new Map<string, Entry>();

function prune(now: number) {
  if (buckets.size < MAX_ENTRIES) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

function current(key: string, now: number): Entry | null {
  const entry = buckets.get(key);
  if (!entry) return null;
  if (entry.resetAt <= now) {
    buckets.delete(key);
    return null;
  }
  return entry;
}

export type LoginGate = { blocked: boolean; retryMin: number };

/** Cek status blokir tanpa menambah hitungan (dipanggil sebelum verifikasi). */
export function loginBlocked(ip: string, email: string): LoginGate {
  const now = Date.now();
  const account = current(`a:${ip}|${email.toLowerCase()}`, now);
  const byIp = current(`i:${ip}`, now);
  const accountBlocked = !!account && account.count >= PER_ACCOUNT;
  const ipBlocked = !!byIp && byIp.count >= PER_IP;
  const retryAt = Math.max(
    accountBlocked ? (account?.resetAt ?? now) : 0,
    ipBlocked ? (byIp?.resetAt ?? now) : 0
  );
  return {
    blocked: accountBlocked || ipBlocked,
    retryMin: retryAt > now ? Math.max(1, Math.ceil((retryAt - now) / 60000)) : 1,
  };
}

function bump(key: string, now: number) {
  const entry = current(key, now);
  if (entry) {
    entry.count += 1;
  } else {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
  }
  prune(now);
}

/** Catat satu kegagalan masuk (IP + kombinasi akun). */
export function recordLoginFailure(ip: string, email: string): void {
  const now = Date.now();
  bump(`i:${ip}`, now);
  bump(`a:${ip}|${email.toLowerCase()}`, now);
}

/** Bersihkan hitungan setelah login berhasil. */
export function clearLoginFailures(ip: string, email: string): void {
  buckets.delete(`i:${ip}`);
  buckets.delete(`a:${ip}|${email.toLowerCase()}`);
}
