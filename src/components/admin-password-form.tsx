"use client";

import { useActionState, useEffect } from "react";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/app/admin/(panel)/settings/actions";
import { showAdminToast } from "@/components/admin-toast";

const inputClass =
  "focus-ring h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-3";

/**
 * Form "Keamanan akun" (R5): ganti kata sandi panel dari dalam aplikasi —
 * penting karena kata sandi awal bisa berupa kata sandi sementara.
 */
export function AdminPasswordForm() {
  const [state, formAction, pending] = useActionState<
    ChangePasswordState,
    FormData
  >(changePasswordAction, {});

  // Hasil selalu berakhir di popup (R29): sukses maupun galat — pesan galat
  // tetap tampil inline di bawah tombol untuk konteks.
  useEffect(() => {
    if (state.ok) showAdminToast("success", state.ok);
    if (state.error) showAdminToast("error", state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-md border border-line bg-surface p-5"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink">Kata sandi saat ini</span>
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink">Kata sandi baru</span>
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
          <span className="text-xs text-ink-3">Minimal 8 karakter.</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink">Ulangi kata sandi baru</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Simpan kata sandi baru"}
        </button>
        <p
          aria-live="polite"
          className={`text-sm ${
            state.error ? "text-ink" : "text-ink-2"
          }`}
        >
          {state.error ?? ""}
        </p>
      </div>
    </form>
  );
}
