"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type StackItem = { title: string; text: string };

// Tata letak dikunci dalam px supaya setiap posisi guliran bisa dihitung,
// bukan diukur: elemen sticky melaporkan posisi lengketnya, bukan posisi
// aslinya, jadi mengukurnya di tengah guliran justru salah.
const VIEWPORT = 480;
const HEADER = 112;
const CARD = 280;
// Jarak guliran antara satu kartu mengendap dan kartu berikutnya datang.
const GAP = 80;
const FIRST_TOP = 20;
// Tiap kartu yang mengendap duduk lebih rendah sekian, menyisakan celah
// setiap kartu di bawahnya tetap terlihat.
const STEP = 14;
// Per kartu yang beristirahat di atas. Empat kartu dalam: 0,84 — masih
// cukup lebar untuk terbaca sebagai kartu, bukan kipas.
const SCALE_PER_CARD = 0.04;
const DIM_PER_CARD = 0.12;
const MAX_DIM = 0.4;

const top = (i: number) => FIRST_TOP + i * STEP;
const natural = (i: number) => HEADER + i * (CARD + GAP);

// Nada warna kartu Persiapan (Tahap H5), paralel dengan indeks `art`.
const TONES = [
  { card: "border-prep-1-ink/25 bg-prep-1", ink: "text-prep-1-ink" },
  { card: "border-prep-2-ink/25 bg-prep-2", ink: "text-prep-2-ink" },
  { card: "border-prep-3-ink/25 bg-prep-3", ink: "text-prep-3-ink" },
  { card: "border-prep-4-ink/25 bg-prep-4", ink: "text-prep-4-ink" },
] as const;

/**
 * Dek kartu bertumpuk: kartu mendekat dan mengendap di atas kartu
 * sebelumnya saat pengunjung menggulir di dalam dek. Satu baca (scrollTop)
 * dan satu batch tulis transform/opacity per frame; tanpa layout thrash.
 */
export function StickyStack({
  items,
  label,
  heading,
  art,
  className,
}: {
  items: StackItem[];
  label: string;
  heading?: React.ReactNode;
  /** Ilustrasi per kartu (paralel dengan `items`); kartu ikut bernada warna. */
  art?: React.ReactNode[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const shades = useRef<(HTMLElement | null)[]>([]);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const dots = useRef<(HTMLElement | null)[]>([]);

  const last = items.length - 1;
  // Cukup ruang di bawah kartu terakhir untuk mencapai posisi mengendapnya,
  // jadi guliran berakhir tepat saat tumpukan selesai.
  const bottomPad = VIEWPORT - CARD - top(last);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    let current = -1;

    // Satu baca (scrollTop) dan satu batch tulis transform dan opacity per
    // frame, tidak ada yang memicu layout.
    const update = () => {
      frame = 0;
      const s = el.scrollTop;
      // Seberapa jauh kartu i+1 meluncur menutupi kartu i, 0 sampai 1.
      const covered = items.map((_, i) => {
        if (i === last) return 0;
        const start = natural(i + 1) - top(i) - CARD;
        const end = natural(i + 1) - top(i + 1);
        return Math.min(Math.max((s - start) / (end - start), 0), 1);
      });

      let depth = 0;
      for (let i = last; i >= 0; i--) {
        depth += covered[i];
        const card = cards.current[i];
        const shade = shades.current[i];
        if (card) {
          card.style.transform = reduceMotion
            ? ""
            : `scale(${1 - depth * SCALE_PER_CARD})`;
        }
        if (shade) {
          shade.style.opacity = reduceMotion
            ? "0"
            : String(Math.min(depth * DIM_PER_CARD, MAX_DIM));
        }
        const fill = fills.current[i];
        if (fill) {
          const arrived = i === 0 ? 1 : covered[i - 1];
          fill.style.transform = `scaleY(${arrived})`;
        }
      }

      const front = covered.filter((c) => c >= 0.5).length;
      if (front !== current) {
        dots.current[current]?.removeAttribute("aria-current");
        dots.current[front]?.setAttribute("aria-current", "step");
        current = front;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items, last, reduceMotion]);

  // Ilustrasi kartu (Tahap H5): arm sekali (garis tersembunyi), lalu gambar
  // saat kartunya benar-benar masuk ke dek. Reduced-motion: garis statis.
  useEffect(() => {
    const el = scroller.current;
    if (!el || reduceMotion) return;
    const arts = Array.from(el.querySelectorAll<HTMLElement>(".prep-art"));
    if (!arts.length || typeof IntersectionObserver === "undefined") return;
    for (const art of arts) art.setAttribute("data-armed", "");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-drawn");
          io.unobserve(entry.target);
        }
      },
      { root: el, threshold: 0.55 },
    );
    for (const card of cards.current) if (card) io.observe(card);
    return () => io.disconnect();
  }, [items, reduceMotion]);

  const goTo = (i: number) => {
    scroller.current?.scrollTo({
      top: i === 0 ? 0 : natural(i) - top(i),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className={cn("flex w-[min(480px,100%)] gap-2", className)}>
      <div
        ref={scroller}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="focus-ring min-w-0 flex-1 overflow-y-auto overscroll-contain rounded-md border border-line bg-surface px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: VIEWPORT }}
      >
        <div style={{ paddingBottom: bottomPad }}>
          <div
            className="flex flex-col justify-center gap-1 px-2"
            style={{ height: HEADER }}
          >
            {heading}
          </div>
          {items.map((item, i) => {
            const tone = art?.[i] ? TONES[i % TONES.length] : null;
            return (
              <article
                key={item.title}
                ref={(node) => {
                  cards.current[i] = node;
                }}
                className={cn(
                  "sticky flex origin-top flex-col justify-between overflow-hidden rounded-md border p-5 will-change-transform sm:p-6",
                  tone ? tone.card : "border-line bg-canvas",
                )}
                style={{
                  top: top(i),
                  height: CARD,
                  marginTop: i === 0 ? 0 : GAP,
                }}
              >
                {tone && art?.[i] ? (
                  <div
                    aria-hidden
                    className={cn(
                      "prep-art pointer-events-none absolute -top-6 -right-6 -z-10 h-36 w-36 sm:h-44 sm:w-44",
                      tone.ink,
                    )}
                    style={{ opacity: "var(--prep-art-opacity)" }}
                  >
                    {art[i]}
                  </div>
                ) : null}
                <span
                  className={cn(
                    "font-display text-sm tabular-nums",
                    tone ? tone.ink : "text-ink-3",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <h3 className="text-2xl font-semibold tracking-tight text-balance">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-pretty text-ink-2 sm:text-[15px]">
                    {item.text}
                  </p>
                </div>
                <div
                  ref={(node) => {
                    shades.current[i] = node;
                  }}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black opacity-0"
                />
              </article>
            );
          })}
        </div>
      </div>
      <nav aria-label={label} className="flex flex-col justify-center">
        {items.map((item, i) => (
          <button
            key={item.title}
            ref={(node) => {
              dots.current[i] = node;
            }}
            type="button"
            aria-label={`${i + 1}. ${item.title}`}
            onClick={() => goTo(i)}
            className="focus-ring group flex h-11 w-11 touch-manipulation items-center justify-center rounded-sm transition-[scale] duration-150 ease-out active:scale-[0.96] motion-reduce:transition-none"
          >
            <span className="h-7 w-[3px] overflow-hidden rounded-full bg-line transition-[scale] duration-150 ease-out group-hover:scale-x-150 motion-reduce:transition-none">
              <span
                ref={(node) => {
                  fills.current[i] = node;
                }}
                className="block size-full origin-top bg-ink"
                // Menyamai posisi guliran 0 sebelum efek pertama berjalan.
                style={{ transform: `scaleY(${i === 0 ? 1 : 0})` }}
              />
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
