"use client";

import { useActionState, useId } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

/**
 * Form masuk panel (nyata): validasi di server lewat Server Action,
 * pesan gagal yang umum (tidak membocorkan email terdaftar), tombol
 * menahan saat memeriksa. Sesi disimpan sebagai cookie httpOnly.
 */
export function AdminLoginForm({ next }: { next?: string }) {
  const emailId = useId();
  const passwordId = useId();
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  const inputClass =
    "focus-ring h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-3";

  return (
    <form
      action={formAction}
      noValidate
      aria-busy={pending}
      className="mt-8 flex flex-col gap-5"
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={emailId} className="text-sm text-ink">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@rrinterior.construction"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? `${emailId}-error` : undefined}
          className={inputClass}
        />
        {emailError ? (
          <p id={`${emailId}-error`} className="text-xs text-ink-2">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={passwordId} className="text-sm text-ink">
          Kata sandi
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? `${passwordId}-error` : undefined}
          className={inputClass}
        />
        {passwordError ? (
          <p id={`${passwordId}-error`} className="text-xs text-ink-2">
            {passwordError}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm leading-relaxed text-ink">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
