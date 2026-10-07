"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Strip karya yang bisa digulir + tombol navigasi nyata.
 * - Satu klik = SATU kartu (bukan melompat satu layar), sesuai lebar kartu
 *   pertama + jarak antar kartu.
 * - Tombol sebelumnya nonaktif di awal; tombol berikutnya nonaktif saat
 *   sudah di ujung kanan (dan sebaliknya) — status dihitung ulang saat
 *   digulir/di-resize.
 * Tombol 44x44 px, menghormati prefers-reduced-motion.
 */
export function WorkStrip({
  children,
  labels,
}: {
  children: ReactNode;
  labels: { prev: string; next: string };
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    setCanPrev(list.scrollLeft > 4);
    setCanNext(max > 4 && list.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    updateEdges();
    list.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges]);

  function scroll(direction: 1 | -1) {
    const list = listRef.current;
    if (!list) return;
    const first = list.querySelector("li");
    const gap = 20; // jarak antar kartu (gap-5)
    const step = first
      ? first.getBoundingClientRect().width + gap
      : Math.max(list.clientWidth * 0.8, 300);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    list.scrollBy({
      left: direction * step,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  const buttonClass = (enabled: boolean) =>
    `focus-ring flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong text-ink transition-colors ${
      enabled
        ? "cursor-pointer hover:bg-hover-surface active:bg-hover-surface"
        : "cursor-not-allowed opacity-40"
    }`;

  return (
    <div className="mt-10 sm:mt-12">
      <div className="flex justify-end gap-2 pb-4">
        <button
          type="button"
          aria-label={labels.prev}
          disabled={!canPrev}
          onClick={() => scroll(-1)}
          className={buttonClass(canPrev)}
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          aria-label={labels.next}
          disabled={!canNext}
          onClick={() => scroll(1)}
          className={buttonClass(canNext)}
        >
          <Chevron direction="right" />
        </button>
      </div>
      <ul
        ref={listRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d={direction === "left" ? "M14.5 6.5 9 12l5.5 5.5" : "M9.5 6.5 15 12l-5.5 5.5"}
      />
    </svg>
  );
}
