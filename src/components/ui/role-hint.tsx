"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/ui/arrow-icon";

export type RoleNote = {
  label: string;
  body: string;
  href: string;
  linkLabel: string;
};

// Menyapu pointer melintasi label tidak membuka apa pun.
const OPEN_DELAY = 180;
// Menutupi momen pointer berada di antara label dan kartu, atau goyang di
// tepinya.
const CLOSE_GRACE = 150;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Label media (Render / Foto lapangan) yang bisa ditanya: hover, fokus
 * papan ketik, atau ketuk membuka kartu penjelasan singkat — jawaban atas
 * kebingungan paling awal pengunjung (PRD §1). Isinya teks biasa + satu
 * tautan lanjutan; tidak ada data yang dikarang.
 */
export function RoleHint({
  note,
  className,
}: {
  note: RoleNote;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastPointer = useRef("mouse");

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    []
  );

  const show = (immediate = false) => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    if (immediate) setOpen(true);
    else openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  };

  const hide = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_GRACE);
  };

  // Ketukan tidak punya hover: ketuk label membuka kartu, ketuk di mana pun
  // di luar menutupnya.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-flex", className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") hide();
      }}
      // Hanya fokus papan ketik; ketukan juga memfokuskan tombol dan tidak
      // boleh membuka-menutup dua kali.
      onFocus={(e) => {
        if (
          e.target === buttonRef.current &&
          e.target.matches(":focus-visible")
        ) {
          show(true);
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onClick={(e) => {
          // Tetikus sudah membukanya lewat hover; ketukan dan papan ketik
          // bergantian membuka-menutup.
          const toggles = e.detail === 0 || lastPointer.current === "touch";
          if (open && toggles) setOpen(false);
          else show(true);
        }}
        className={cn(
          // Area sentuh ditinggikan ke >=44px lewat lapisan transparan
          // (pola burger) supaya pil tetap mungil di atas foto tetapi
          // nyaman diketuk di ponsel (R15j).
          "label-plate focus-ring relative cursor-help gap-1.5 transition-colors after:absolute after:-inset-x-2 after:-inset-y-3 after:content-['']",
          open && "bg-primary-hover"
        )}
      >
        {note.label}
        <span
          aria-hidden
          className="inline-flex size-3.5 items-center justify-center rounded-full border border-plate-ink/50 text-[9px] leading-none font-semibold"
        >
          i
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="absolute top-full left-0 z-50 mt-2 block w-[320px] max-w-[calc(100vw-24px)] rounded-md border border-line bg-surface p-4 text-left text-sm leading-relaxed font-normal whitespace-normal text-ink-2 shadow-xl"
          >
            <span className="block font-display text-base text-ink">
              {note.label}
            </span>
            <span className="mt-1 block text-pretty">{note.body}</span>
            <Link
              href={note.href}
              className="focus-ring mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary lg:min-h-0"
            >
              {note.linkLabel}
              <ArrowIcon />
            </Link>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
