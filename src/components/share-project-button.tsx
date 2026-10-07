"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { WhatsAppGlyph } from "@/components/ui/channel-glyphs";

type ShareLabels = {
  share: string;
  copyLink: string;
  linkCopied: string;
  copyLinkFailed: string;
  shareLinkFailed: string;
  close: string;
};

type Feedback =
  | { kind: "none" }
  | { kind: "copied" }
  | { kind: "copy-failed"; url: string }
  | { kind: "share-failed"; url: string };

const subscribeNoop = () => () => {};
const hasDeviceShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const noDeviceShare = () => false;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// Pil berubah bentuk tanpa memantul, jadi tepinya tidak pernah melewati
// ikon yang sedang ia buka atau sembunyikan (mengikuti referensi).
const RESHAPE = { type: "spring", duration: 0.4, bounce: 0 } as const;

// Satu keluarga ikon: kisi 16px, stroke 1.4, ujung membulat.
const stroke = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "size-4",
} as const;

const Icon = {
  share: (
    <svg {...stroke}>
      <path d="M8 9.5V2.5M5.25 5.25 8 2.5l2.75 2.75M3.5 8v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" />
    </svg>
  ),
  link: (
    <svg {...stroke}>
      <path d="M6.25 9.75l3.5-3.5M7 4.25l1.05-1.05a3.25 3.25 0 0 1 4.6 4.6L11.6 8.85M9 11.75l-1.05 1.05a3.25 3.25 0 0 1-4.6-4.6L4.4 7.15" />
    </svg>
  ),
  check: (
    <svg {...stroke}>
      <path d="M3.5 8.25l3 3 6-6.5" />
    </svg>
  ),
  close: (
    <svg {...stroke}>
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
    </svg>
  ),
  whatsapp: <WhatsAppGlyph className="size-4" />,
};

/**
 * Aksi berbagi proyek pada halaman detail (R14d, mengikuti desain referensi
 * pil yang berubah bentuk, disesuaikan ke token situs):
 * satu pil "Bagikan" yang membuka sasaran di dalam pilnya sendiri — salin
 * tautan (berubah menjadi centang + kata "Tersalin"), WhatsApp dengan teks
 * berisi judul + tautan proyek (kanal resmi PRD), berbagi bawaan perangkat
 * bila perangkat mendukung, dan tombol tutup.
 *
 * Umpan balik jujur tetap: kegagalan salin atau berbagi menampilkan tautan
 * yang bisa dipilih manual. Berbagi yang dibatalkan pengguna bukan kegagalan.
 */
export function ShareProjectButton({
  title,
  labels,
}: {
  title: string;
  labels: ShareLabels;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "none" });
  const timeout = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const usingKeys = useRef(false);
  const canShare = useSyncExternalStore(
    subscribeNoop,
    hasDeviceShare,
    noDeviceShare
  );
  // URL kanonis dibaca lewat store (SSR-aman, tanpa setState di effect).
  const url = useSyncExternalStore(
    subscribeNoop,
    () => window.location.href,
    () => ""
  );

  useEffect(
    () => () => {
      if (timeout.current) window.clearTimeout(timeout.current);
    },
    []
  );

  const clearTimer = () => {
    if (timeout.current) window.clearTimeout(timeout.current);
    timeout.current = null;
  };

  const toggle = (next: boolean, focusFirst = false) => {
    clearTimer();
    setFeedback({ kind: "none" });
    setOpen(next);
    if (!usingKeys.current) return;
    requestAnimationFrame(() =>
      (next && focusFirst ? firstRef.current : triggerRef.current)?.focus({
        preventScroll: true,
      })
    );
  };

  // Esc menutup; tekan di luar juga.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      usingKeys.current = true;
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copyLink() {
    clearTimer();
    const target = url || window.location.href;
    try {
      await navigator.clipboard.writeText(target);
      setFeedback({ kind: "copied" });
      timeout.current = window.setTimeout(
        () => setFeedback({ kind: "none" }),
        2200
      );
    } catch {
      setFeedback({ kind: "copy-failed", url: target });
    }
  }

  async function shareLink() {
    clearTimer();
    const target = url || window.location.href;
    try {
      await navigator.share({ title, url: target });
      setFeedback({ kind: "none" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback({ kind: "share-failed", url: target });
    }
  }

  const waHref =
    url.length > 0
      ? `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
      : undefined;

  const t = reduceMotion ? { duration: 0 } : RESHAPE;
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: EASE_OUT };

  const targetClass =
    "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-sm text-ink outline-hidden transition-[background-color,color,scale] duration-150 ease-out hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-primary active:scale-[0.96] motion-reduce:transition-none";

  return (
    <div ref={rootRef} className="relative inline-flex flex-col items-start">
      <motion.div
        layout
        transition={t}
        onPointerDownCapture={() => (usingKeys.current = false)}
        onKeyDownCapture={() => (usingKeys.current = true)}
        style={{ borderRadius: 4 }}
        className="relative flex h-11 items-center overflow-hidden border border-line-strong bg-surface"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {!open ? (
            <motion.button
              key="share"
              ref={triggerRef}
              layout="position"
              type="button"
              aria-expanded={false}
              onClick={() => toggle(true, true)}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.1 } }}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-sm px-4 text-sm font-medium text-ink transition-[background-color] duration-150 ease-out hover:bg-hover-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-primary active:scale-[0.97]"
            >
              {Icon.share}
              {labels.share}
            </motion.button>
          ) : (
            <motion.div
              key="targets"
              layout="position"
              role="group"
              aria-label={`${labels.share}: ${title}`}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.1 } }}
              transition={fade}
              className="flex shrink-0 items-center gap-0.5 p-1"
            >
              <motion.button
                ref={firstRef}
                layout="position"
                type="button"
                aria-label={
                  feedback.kind === "copied" ? labels.linkCopied : labels.copyLink
                }
                onClick={() => void copyLink()}
                className={`${targetClass} w-auto gap-1.5 px-2.5`}
              >
                <span className="relative grid size-4 place-items-center">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={feedback.kind === "copied" ? "check" : "link"}
                      initial={{ opacity: 0, scale: 0.25 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.25 }}
                      transition={fade}
                      className="grid place-items-center"
                    >
                      {feedback.kind === "copied" ? Icon.check : Icon.link}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <AnimatePresence initial={false}>
                  {feedback.kind === "copied" ? (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={reduceMotion ? { duration: 0 } : RESHAPE}
                      className="overflow-hidden text-[13px] font-medium whitespace-nowrap"
                    >
                      {labels.linkCopied}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>

              <a
                href={waHref}
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                className={targetClass}
              >
                {Icon.whatsapp}
              </a>

              {canShare ? (
                <button
                  type="button"
                  aria-label={labels.share}
                  onClick={() => void shareLink()}
                  className={targetClass}
                >
                  {Icon.share}
                </button>
              ) : null}

              <span aria-hidden className="mx-1 h-5 w-px bg-line-strong" />
              <button
                type="button"
                aria-label={labels.close}
                onClick={() => toggle(false)}
                className={targetClass}
              >
                {Icon.close}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <span className="sr-only" aria-live="polite">
        {feedback.kind === "copied" ? labels.linkCopied : ""}
      </span>

      {feedback.kind === "copy-failed" || feedback.kind === "share-failed" ? (
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-ink-2">
          {feedback.kind === "copy-failed"
            ? labels.copyLinkFailed
            : labels.shareLinkFailed}{" "}
          <span className="select-all break-all font-mono">{feedback.url}</span>
        </p>
      ) : null}
    </div>
  );
}
