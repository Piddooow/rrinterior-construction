"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Tombol submit dengan konfirmasi (R24c): sebelum aksi berisiko berjalan,
 * dialog kecil menjelaskan akibatnya dalam satu baris — admin menyetujui
 * dengan sadar, atau membatalkan. Dipakai untuk aksi yang mengubah
 * visibilitas publik atau menghapus data.
 *
 * Dialog dirender lewat portal ke `document.body` karena `[data-admin-rise]`
 * menyimpan `transform` (fill-mode both) yang akan menjebak `position:
 * fixed` di dalamnya — pola yang sama dengan penampil foto (R19).
 */
export function ConfirmButton({
  title,
  risk,
  confirmLabel,
  children,
  className,
  formAction,
  disabled,
}: {
  title: string;
  risk: string;
  confirmLabel: string;
  children: React.ReactNode;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="submit"
        formAction={formAction}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div
                aria-hidden="true"
                onClick={close}
                className="absolute inset-0 bg-[#130f0b]/40 backdrop-blur-[6px]"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={id}
                className="card-in relative w-full max-w-sm rounded-md border border-line bg-surface p-5 shadow-xl"
              >
                <h2
                  id={id}
                  className="font-display text-lg leading-snug text-balance text-ink"
                >
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {risk}
                </p>
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="btn btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    ref={confirmRef}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      const button = buttonRef.current;
                      if (button?.form) button.form.requestSubmit(button);
                    }}
                    className="btn btn-primary"
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
