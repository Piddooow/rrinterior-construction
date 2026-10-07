"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { initGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Ritme rotasi: cukup lama untuk dibaca, cukup pendek untuk terasa hidup.
const ROTATE_EVERY = 3200;

/**
 * Judul hero dengan kata terakhir yang berganti (gaya WordRotator):
 * kata lama naik memudar, kata baru naik masuk dari bawah — gerak kecil
 * (belasan piksel) yang seluruhnya dibawa opacity, TANPA mask/overflow
 * tersembunyi, sehingga tampil identik di semua peramban dan tidak mungkin
 * bocor keluar barisnya.
 *
 * Sejak R3 kalimat mengalir alami seperti teks biasa (permintaan klien):
 * tidak ada baris yang dipaksa putus oleh sizer grid — kata bergilir
 * dicadangkan lebarnya secara inline (min-width) supaya tidak ada lompat
 * tata letak saat kata berganti. Reduced-motion menukar kata tanpa gerak.
 */
export function WordRotator({
  prefix,
  words,
  conjunction,
  className,
}: {
  prefix: string;
  words: string[];
  /** Kata sambung untuk kalimat pembaca layar ("atau" / "or"). */
  conjunction: string;
  className?: string;
}) {
  const [word, setWord] = useState(0);
  const index = useRef(0);
  const element = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (words.length < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden || busy.current) return;
      const next = (index.current + 1) % words.length;
      const el = element.current;

      if (prefersReducedMotion() || !el) {
        index.current = next;
        setWord(next);
        return;
      }

      busy.current = true;
      initGsap();
      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false;
        },
      });
      tl.to(el, {
        yPercent: -14,
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in",
      });
      tl.add(() => {
        index.current = next;
        setWord(next);
        el.textContent = words[next];
      });
      tl.fromTo(
        el,
        { yPercent: 14, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
      );
    }, ROTATE_EVERY);
    return () => window.clearInterval(id);
  }, [words]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  const tail = words.length > 1 ? ` ${conjunction} ${words[words.length - 1]}` : "";
  const sentence = `${prefix} ${words.slice(0, -1).join(", ")}${tail}.`;

  return (
    <span className={cn("inline", className)}>
      <span className="sr-only">{sentence}</span>
      {/* Aliran teks normal (bukan grid terkunci): kalimat membungkus alami
          seperti paragraf, dan lebar kata bergilir tetap dicadangkan lewat
          min-width pada kata terpanjang agar baris tidak melompat. */}
      <span aria-hidden>
        {prefix}{" "}
        <span
          ref={element}
          className="inline-block will-change-transform"
          style={{ minWidth: `${longest.length}ch` }}
        >
          {words[word] ?? ""}
        </span>
      </span>
    </span>
  );
}
