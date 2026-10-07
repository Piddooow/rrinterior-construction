"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { MediaImage } from "@/components/ui/media-image";

export type ArchivePostButtonLabels = {
  viewPhoto: string;
  viewer: string;
  close: string;
  openOnInstagram: string;
  /** Template "{n}" dan "{total}" untuk catatan jumlah foto. */
  note: string;
};

/**
 * Thumbnail unggahan arsip dengan **penampil in-site** (permintaan RR, R3):
 * klik membuka foto ukuran besar di atas halaman gelap dengan keterangan,
 * catatan jumlah foto, dan tombol "Lihat di Instagram" untuk unggahan
 * aslinya — pengunjung tidak lagi langsung terlempar ke luar situs.
 *
 * A11y: dialog `aria-modal`, fokus terkurung (Tab), Escape menutup, gulir
 * halaman terkunci, dan fokus kembali ke thumbnail saat ditutup.
 */
export function ArchivePostButton({
  href,
  ariaLabel,
  className,
  sizes,
  cover,
  excerpt,
  meta,
  photos,
  labels,
  children,
}: {
  href: string;
  ariaLabel: string;
  className?: string;
  sizes: string;
  cover: { src: string; width: number; height: number };
  excerpt: string;
  meta: string;
  photos: number;
  labels: ArchivePostButtonLabels;
  /** Lapisan di atas foto (veil + label) dari server component. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = [
        ...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ].filter((el) => el.getClientRects().length > 0);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        className={className}
      >
        <MediaImage
          src={cover.src}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-[scale] duration-500 group-hover:scale-[1.03]"
        />
        {children}
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.viewer}
          data-default="dark"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-[#130f0b]/95 p-4 text-ink backdrop-blur-sm sm:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="focus-ring absolute right-0 top-0 z-10 flex size-11 items-center justify-center rounded-sm bg-plate/80 text-plate-ink transition-colors hover:bg-plate"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md bg-plate">
              <MediaImage
                src={cover.src}
                alt={excerpt || labels.viewPhoto}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-ink-3">
                  {meta}
                </p>
                {excerpt ? (
                  <p
                    data-quote=""
                    className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-2"
                  >
                    {excerpt}
                  </p>
                ) : null}
                {photos > 1 ? (
                  <p className="mt-1.5 text-xs text-ink-3">
                    {labels.note
                      .replace("{n}", "1")
                      .replace("{total}", String(photos))}
                  </p>
                ) : null}
              </div>
              <a
                href={href}
                target="_blank"
                rel="noopener"
                className="btn btn-secondary"
              >
                {labels.openOnInstagram}
                <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
