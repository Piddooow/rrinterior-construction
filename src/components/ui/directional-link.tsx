"use client";

import { useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Side = "left" | "right";

// Inset klip (kiri, kanan) untuk tiap posisi istirahat garis. "Tersembunyi
// di sisi X" berarti terlipat ke tepi itu: menggambar dari sana berarti
// tumbuh menjauhinya, dan menghilang ke sana berarti menyusut ke dalamnya.
const HIDDEN_AT: Record<Side, [string, string]> = {
  left: ["0%", "100%"],
  right: ["100%", "0%"],
};
const SHOWN: [string, string] = ["0%", "0%"];

function set(el: HTMLElement, [l, r]: [string, string]) {
  el.style.setProperty("--ul-l", l);
  el.style.setProperty("--ul-r", r);
}

// hidden: apakah garis benar-benar hilang. Hanya saat itu aman memindahkannya
// ke tepi lain; di tengah menghilang ia cukup berbalik dari posisinya.
function draw(el: HTMLElement, hidden: { current: boolean }, from: Side) {
  if (hidden.current) {
    el.dataset.instant = "";
    set(el, HIDDEN_AT[from]);
    // Menegaskan posisi awal sebelum transisi dihidupkan kembali.
    void el.offsetWidth;
    delete el.dataset.instant;
  }
  hidden.current = false;
  delete el.dataset.leaving;
  el.dataset.on = "";
  set(el, SHOWN);
}

function erase(el: HTMLElement, toward: Side) {
  el.dataset.leaving = "";
  delete el.dataset.on;
  set(el, HIDDEN_AT[toward]);
}

function sideOf(el: HTMLElement, clientX: number): Side {
  const r = el.getBoundingClientRect();
  return clientX < r.left + r.width / 2 ? "left" : "right";
}

/**
 * Tautan dengan garis bawah terarah: garisnya tumbuh dari sisi tempat
 * pointer masuk dan menyusut ke sisi tempat pointer keluar — arah gerak
 * datang dari gerak pengunjung sendiri. Klip (bukan scaleX): titik asalnya
 * tidak bisa melompat di tengah jalan dan bisa berbalik dari kondisi
 * separuh. Fokus papan ketik menggambar dari kiri (arah baca).
 */
export function DirectionalLink({
  className,
  rest = false,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<"a"> & {
  /** Garis tipis saat istirahat, untuk tautan di dalam prosa. */
  rest?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const hidden = useRef(true);
  const hovered = useRef(false);

  return (
    <a
      ref={ref}
      {...props}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (e.pointerType === "touch") return;
        hovered.current = true;
        draw(e.currentTarget, hidden, sideOf(e.currentTarget, e.clientX));
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        if (e.pointerType === "touch") return;
        hovered.current = false;
        // Fokus papan ketik masih memiliki garisnya.
        if (e.currentTarget.matches(":focus-visible")) return;
        erase(e.currentTarget, sideOf(e.currentTarget, e.clientX));
      }}
      onFocus={(e) => {
        onFocus?.(e);
        // Urutan baca: tautan yang difokus menggambar dari awal teks.
        if (e.currentTarget.matches(":focus-visible")) {
          draw(e.currentTarget, hidden, "left");
        }
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (!hovered.current) erase(e.currentTarget, "right");
      }}
      // transitionend pseudo-element dikirim ke host-nya, jadi
      // target === currentTarget di sini berarti garisnya sendiri yang usai.
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget || e.propertyName !== "clip-path") {
          return;
        }
        const l = e.currentTarget.style.getPropertyValue("--ul-l");
        const r = e.currentTarget.style.getPropertyValue("--ul-r");
        hidden.current = l === "100%" || r === "100%";
      }}
      className={cn(
        "focus-ring relative inline-block rounded-[2px] leading-tight whitespace-nowrap text-ink outline-hidden",
        // Garis tipis saat istirahat, untuk prosa di mana tautan harus
        // tetap terlihat seperti tautan.
        rest &&
          "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-line-strong",
        // Garis yang digambar. Masuk 240ms, keluar 180ms.
        "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink after:[clip-path:inset(0_var(--ul-r,100%)_0_var(--ul-l,0%))]",
        "after:transition-[clip-path] after:duration-[240ms] after:ease-[cubic-bezier(0.23,1,0.32,1)]",
        "data-leaving:after:duration-[180ms] data-instant:after:transition-none",
        // Reduced motion: garis memudar utuh, tidak berjalan.
        "motion-reduce:after:[clip-path:none] motion-reduce:after:opacity-0 motion-reduce:after:transition-[opacity] motion-reduce:hover:after:opacity-100 motion-reduce:focus-visible:after:opacity-100 motion-reduce:data-on:after:opacity-100",
        className
      )}
    >
      {children}
    </a>
  );
}
