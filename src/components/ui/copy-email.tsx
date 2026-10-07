"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/ui/arrow-icon";

type Status = "idle" | "copied" | "failed";

// Flip satu huruf. Tiap huruf mulai satu ketukan setelah tetangga kirinya,
// jadi pesannya terbaca sebagai gelombang yang berjalan melalui alamat.
const FLIP = { duration: 0.22, ease: [0.23, 1, 0.32, 1] } as const;
const STAGGER = 0.018;
// Kotak melebar/menyempit dengan tenang mengikuti panjang pesan yang aktif
// — hanya lebarnya yang dianimasikan, sehingga huruf-huruf di sekitarnya
// mengalir ulang dengan halus.
const WIDTH_MS = 320;

/**
 * Alamat email yang bisa disalin: satu klik menyalin, huruf-hurufnya
 * berbalik untuk mengonfirmasi, lalu kembali tenang.
 *
 * R21: jumlah slot huruf kini TETAP (maksimum dari semua pesan, sisa slot
 * menjadi spasi yang ikut ber-flip) sehingga DOM tidak berubah saat pesan
 * berganti — gelombang flip tidak patah. Lebar kotak diukur dari cermin
 * tersembunyi berisi teks aktif (huruf per slot, tanpa kerning, memakai
 * font situs) lalu dianimasikan; garis bawah halus mengikuti lebar aktif
 * sehingga terasa seamless dan tetap elegan. Panah mailto di samping
 * membuka aplikasi email.
 */
export function CopyEmail({
  email,
  labels,
  resetAfter = 1600,
  className,
}: {
  email: string;
  labels: { copy: string; copied: string; failed: string; hint: string };
  /** Lama konfirmasi tampil sebelum kembali ke alamat. */
  resetAfter?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [width, setWidth] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const attempt = useRef(0);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = (next: Exclude<Status, "idle">) => {
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), resetAfter);
  };

  const copy = async () => {
    const id = ++attempt.current;
    // Konfirmasi langsung saat ditekan; penulisan nyaris instan dan
    // menunggunya membuat klik terasa diabaikan.
    show("copied");
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(email);
    } catch {
      if (id === attempt.current) show("failed");
    }
  };

  const shown =
    status === "copied"
      ? labels.copied
      : status === "failed"
        ? labels.failed
        : email;

  // Slot huruf tetap: pesan terpanjang menentukan jumlah huruf; sisa slot
  // menjadi spasi yang ikut ber-flip sehingga tidak ada huruf yang lenyap
  // mendadak saat pesan berganti.
  const slots = Math.max(
    email.length,
    labels.copied.length,
    labels.failed.length,
    13
  );

  // Lebar diukur dari cermin (teks aktif, huruf per slot tanpa kerning)
  // lalu dipasang pada kotak flip; diukur ulang saat font situs selesai
  // dimuat dan saat ukuran viewport berubah (font membesar di breakpoint sm).
  useLayoutEffect(() => {
    const el = mirrorRef.current;
    if (!el) return;
    const measure = () => {
      const next = el.offsetWidth;
      if (next > 0) setWidth(next);
    };
    measure();
    if (typeof document.fonts?.ready?.then === "function") {
      document.fonts.ready.then(measure).catch(() => {});
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [shown]);

  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1", className)}>
      <span className="group/copy relative inline-flex min-w-0">
        <button
          type="button"
          onClick={copy}
          aria-label={labels.copy.replace("{email}", email)}
          className="focus-ring relative flex min-h-11 min-w-0 touch-manipulation items-center rounded-sm pr-1.5 text-xs text-ink-2 transition-colors duration-150 ease-out select-none hover:bg-hover-surface hover:text-ink active:scale-[0.96] sm:text-sm motion-reduce:transition-[background-color,color]"
        >
          {/* Pembungkus garis bawah (R21c): mengikuti lebar kotak flip yang
              dianimasikan, jadi garisnya selalu rapi dan tidak patah. */}
          <span className="relative inline-flex after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-current after:opacity-30 after:transition-opacity after:duration-200 after:ease-out group-hover/copy:after:opacity-60">
            <span
              aria-hidden
              className="flex overflow-hidden [perspective:240px]"
              style={{
                width: width ? `${width}px` : undefined,
                transition: reduceMotion
                  ? "none"
                  : `width ${WIDTH_MS}ms cubic-bezier(0.77,0,0.175,1)`,
              }}
            >
              {Array.from({ length: slots }, (_, i) => (
                <Letter
                  key={i}
                  char={shown[i] ?? " "}
                  delay={i * STAGGER}
                  reduceMotion={reduceMotion}
                />
              ))}
            </span>
          </span>

          {/* Cermin ukur: teks aktif dengan huruf per slot (tanpa kerning),
              tidak terlihat dan tidak memengaruhi tata letak. */}
          <span
            aria-hidden
            ref={mirrorRef}
            className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
          >
            {Array.from(shown).map((char, i) => (
              <span key={i} className="inline-block whitespace-pre">
                {char}
              </span>
            ))}
          </span>
        </button>

        {/* Bisikan tentang apa yang dilakukan klik; disembunyikan begitu
            teksnya sendiri berbicara, dan tidak pernah di sentuh. Rata kiri
            supaya sejajar dengan alamat dan tidak keluar layar di ponsel. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-full left-0 mb-1 translate-y-0.5 rounded-full bg-ink px-2 py-0.5 text-xs font-medium whitespace-nowrap text-canvas opacity-0",
            "transition-[opacity,translate] duration-100 ease-out [@media(hover:hover)]:group-hover/copy:translate-y-0 [@media(hover:hover)]:group-hover/copy:opacity-100 [@media(hover:hover)]:group-hover/copy:delay-300 [@media(hover:hover)]:group-hover/copy:duration-150",
            status !== "idle" && "invisible"
          )}
        >
          {labels.hint}
        </span>
      </span>

      <a
        href={`mailto:${email}`}
        aria-label={`Email ${email}`}
        className="focus-ring relative flex size-9 shrink-0 touch-manipulation items-center justify-center rounded-sm text-ink-3 outline-hidden transition-[scale,color,background-color] duration-150 ease-out after:absolute after:-inset-1.5 hover:bg-hover-surface hover:text-ink active:scale-[0.96]"
      >
        <ArrowIcon />
      </a>

      <span className="sr-only" aria-live="polite">
        {status === "copied"
          ? labels.copied
          : status === "failed"
            ? labels.failed
            : ""}
      </span>
    </span>
  );
}

function Letter({
  char,
  delay,
  reduceMotion,
}: {
  char: string;
  delay: number;
  reduceMotion: boolean | null;
}) {
  // Dua muka: huruf yang tampil, dan huruf yang sedang ia tinggalkan.
  // Pasangannya di-key pada char sehingga flip hanya berulang untuk slot
  // yang berubah.
  const [faces, setFaces] = useState({ now: char, was: char });
  if (faces.now !== char) setFaces({ now: char, was: faces.now });

  const changed = faces.now !== faces.was;
  return (
    <span className="relative inline-block whitespace-pre [transform-style:preserve-3d]">
      <motion.span
        key={`in-${faces.now}-${faces.was}`}
        className="block origin-[50%_50%_-0.5em] backface-hidden"
        initial={
          changed
            ? reduceMotion
              ? { opacity: 0 }
              : { rotateX: -90, opacity: 0 }
            : false
        }
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ ...FLIP, delay: reduceMotion ? 0 : delay }}
      >
        {faces.now}
      </motion.span>
      {changed ? (
        <motion.span
          key={`out-${faces.now}-${faces.was}`}
          aria-hidden
          className="absolute inset-0 block origin-[50%_50%_-0.5em] backface-hidden"
          initial={{ rotateX: 0, opacity: 1 }}
          animate={reduceMotion ? { opacity: 0 } : { rotateX: 90, opacity: 0 }}
          transition={{ ...FLIP, delay: reduceMotion ? 0 : delay }}
        >
          {faces.was}
        </motion.span>
      ) : null}
    </span>
  );
}
