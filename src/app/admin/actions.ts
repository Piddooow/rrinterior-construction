"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate } from "@/lib/auth";
import { endSession, startSession } from "@/lib/admin-auth";
import {
  clearLoginFailures,
  loginBlocked,
  recordLoginFailure,
} from "@/lib/rate-limit";

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * `next` hanya boleh menunjuk kembali ke area admin — mencegah open redirect
 * lewat alamat yang ditempel di URL halaman masuk.
 */
function safeNext(raw: string): string {
  if (raw === "/admin" || raw.startsWith("/admin/")) {
    if (!raw.includes("//") && !raw.includes("\\") && !raw.includes(":")) {
      return raw;
    }
  }
  return "/admin";
}

/**
 * Aksi masuk panel. Gagal selalu dengan pesan umum — tidak membocorkan
 * email mana yang terdaftar. Redirect dipanggil DI LUAR blok try agar
 * sinyal NEXT_REDIRECT tidak tertangkap.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Masukkan alamat email yang benar.";
  }
  if (password.length === 0) {
    fieldErrors.password = "Kata sandi wajib diisi.";
  }
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  // Pembatas percobaan masuk (R5): blokir sebelum verifikasi kata sandi.
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "lokal";
  const gate = loginBlocked(ip, email);
  if (gate.blocked) {
    return {
      error: `Terlalu banyak percobaan masuk. Coba lagi sekitar ${gate.retryMin} menit lagi.`,
    };
  }

  const user = await authenticate(email, password);
  if (!user) {
    recordLoginFailure(ip, email);
    return { error: "Email atau kata sandi tidak cocok." };
  }

  clearLoginFailures(ip, email);
  await startSession(user.id);
  redirect(next);
}

/** Keluar dari panel: akhiri sesi lalu kembali ke halaman masuk. */
export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
