"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArrowIcon } from "@/components/ui/arrow-icon";

// Timing animasi
const STRIP_COUNT = 10;
const REVEAL_DURATION = 0.5;
const STRIP_STAGGER = 0.04;
const ZOOM_DURATION = 0.9;
const ZOOM_FROM = 1.2;
const AUTOPLAY_INTERVAL = 5000;
const PROGRESS_DURATION = 0.9;

export type ParallaxSlide = {
  src: string;
  title: string;
  /** Label kecil di atas judul (mis. lingkup kerja). */
  chapter?: string;
  /** Tautan halaman detail proyek untuk slide ini. */
  href?: string;
};

export type ParallaxStripSliderProps = {
  slides: ParallaxSlide[];
  className?: string;
  /** Label aksesibilitas (punya bawaan bahasa Inggris). */
  labels?: {
    region?: string;
    prev?: string;
    next?: string;
    view?: string;
  };
  stripCount?: number;
  revealDuration?: number;
  stripStagger?: number;
  zoomFrom?: number;
  zoomDuration?: number;
  autoplay?: boolean;
  showProgressBar?: boolean;
  showCounter?: boolean;
  showControls?: boolean;
  accentColor?: string;
  backgroundColor?: string;
};

type TransitionDirection = "next" | "prev";

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

/**
 * Slider karya dengan reveal strip + zoom Ken-Burns, diadaptasi dari
 * ParallaxStripSlider (21st.dev) untuk situs RR:
 * - tanpa dependensi baru & tanpa Google Fonts (judul memakai font display situs),
 * - tombol prev/next + tautan "lihat proyek" yang bisa dijangkau papan ketik,
 * - kursor kustom berhenti saat diam (tanpa loop rAF permanen),
 * - prefers-reduced-motion: transisi instan, autoplay mati, kursor mati.
 */
export default function ParallaxStripSlider({
  slides,
  className = "",
  labels,
  stripCount = STRIP_COUNT,
  revealDuration = REVEAL_DURATION,
  stripStagger = STRIP_STAGGER,
  zoomFrom = ZOOM_FROM,
  zoomDuration = ZOOM_DURATION,
  autoplay = false,
  showProgressBar = true,
  showCounter = true,
  showControls = true,
  accentColor = "#ffffff",
  backgroundColor = "#000000",
}: ParallaxStripSliderProps) {
  const copy = {
    region: labels?.region ?? "Featured work",
    prev: labels?.prev ?? "Previous project",
    next: labels?.next ?? "Next project",
    view: labels?.view ?? "See project",
  };

  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [caption, setCaption] = useState(0);
  const [direction, setDirection] = useState<TransitionDirection>("next");
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const counterNumRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stripsRef = useRef<HTMLDivElement[]>([]);
  const zoomRef = useRef<HTMLDivElement[]>([]);
  const isAnimating = useRef(false);
  const isFirstCaption = useRef(true);

  // Kursor navigasi bundar (desktop, pointer halus).
  const cursorRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const isInside = useRef(false);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  const total = slides.length;

  // Touch vs. mouse menentukan tata letak (bukan lebar mentah): bingkai
  // sempit yang digerakkan tetikus tetap memakai pengalaman desktop.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = useCallback(
    (next: number, transitionDirection: TransitionDirection) => {
      if (isAnimating.current || next === current || total < 2) return;
      isAnimating.current = true;
      setDirection(transitionDirection);
      setIncoming(next);
    },
    [current, total]
  );

  const onNext = useCallback(
    () => goTo((current + 1) % total, "next"),
    [current, total, goTo]
  );
  const onPrev = useCallback(
    () => goTo((current - 1 + total) % total, "prev"),
    [current, total, goTo]
  );

  // Maju otomatis; berhenti saat transisi berjalan, reduced motion, atau
  // tab tidak aktif. Interval di-reset tiap slide berganti sehingga iramanya
  // tetap ~5 detik mulai-ke-mulai.
  useEffect(() => {
    if (!autoplay || total < 2) return;
    if (typeof window !== "undefined" && prefersReducedMotion()) return;
    let id: number | null = null;
    const tick = () => {
      if (!document.hidden && !isAnimating.current) onNext();
    };
    const start = () => {
      if (id === null) id = window.setInterval(tick, AUTOPLAY_INTERVAL);
    };
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [autoplay, total, onNext]);

  // Wipe + zoom + progress saat slide berganti.
  useGSAP(
    () => {
      if (incoming === null) return;

      const strips = stripsRef.current.slice(0, stripCount).filter(Boolean);
      const zooms = zoomRef.current.slice(0, stripCount).filter(Boolean);
      if (!strips.length) return;
      const isPrevious = direction === "prev";
      const orderedStrips = isPrevious ? [...strips].reverse() : strips;

      if (prefersReducedMotion()) {
        setCaption(incoming);
        setCurrent(incoming);
        setIncoming(null);
        isAnimating.current = false;
        return;
      }

      const settle = () => {
        setCaption(incoming);
        setCurrent(incoming);
        setIncoming(null);
        isAnimating.current = false;
      };

      const tl = gsap.timeline({ onComplete: settle });

      tl.fromTo(
        orderedStrips,
        { clipPath: isPrevious ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
        {
          clipPath: isPrevious ? "inset(0 0 0 0%)" : "inset(0 0% 0 0)",
          duration: revealDuration,
          ease: "power3.out",
          stagger: stripStagger,
        },
        0
      );

      tl.fromTo(
        zooms,
        { scale: zoomFrom },
        {
          scale: 1,
          duration: zoomDuration,
          ease: "power3.out",
        },
        0
      );

      if (progressRef.current) {
        tl.to(
          progressRef.current,
          {
            scaleX: (incoming + 1) / total,
            duration: PROGRESS_DURATION,
            ease: "power3.inOut",
          },
          0
        );
      }

      const outgoing = [captionRef.current, counterRef.current].filter(
        Boolean
      );
      if (outgoing.length) {
        tl.to(
          outgoing,
          { autoAlpha: 0, y: -2, duration: 0.35, ease: "power2.in" },
          0.15
        );
      }
      // Judul TIDAK ikut memudar: ia ditukar tepat di sini lalu naik dari
      // balik mask-nya sendiri (lihat efek entrance), sehingga tidak pernah
      // ada bingkai "teks hilang".
      tl.add(() => setCaption(incoming), 0.5);
    },
    {
      dependencies: [
        incoming,
        direction,
        stripCount,
        revealDuration,
        stripStagger,
        zoomFrom,
        zoomDuration,
      ],
      scope: rootRef,
    }
  );

  // Entrance judul: blok judul naik dari balik mask miliknya sendiri
  // (transform murni di dalam wadah ber-overflow-hidden). Tidak ada
  // pengukuran teks, tidak ada pemecahan huruf, dan sizer menjaga tinggi
  // blok tetap — jadi tidak ada reflow, kedip, maupun teks yang bergeser
  // dari posisi finalnya saat masuk.
  useGSAP(
    () => {
      if (isFirstCaption.current) {
        isFirstCaption.current = false;
        return;
      }
      if (!captionRef.current || !titleRef.current) return;

      // Penjaga: React sudah menulis judul aktif; samakan bila sisa animasi
      // lama sempat menimpanya.
      titleRef.current.textContent = slides[caption]?.title ?? "";

      gsap.set(captionRef.current, { autoAlpha: 1, y: 0 });

      if (prefersReducedMotion()) {
        gsap.set(
          [
            chapterRef.current,
            titleRef.current,
            counterRef.current,
            counterNumRef.current,
          ],
          { autoAlpha: 1, y: 0, yPercent: 0, clearProps: "transform" }
        );
        return;
      }

      // Masuk satu per bagian (kicker, judul, penghitung) dengan selang
      // kecil agar terasa mengalir, bukan muncul serentak (R2). Tautan
      // "Lihat proyek" sengaja TIDAK ikut beranimasi agar CTA tidak
      // bergeser dari posisinya saat slide berganti.
      const tl = gsap.timeline();
      tl.fromTo(
        titleRef.current,
        { yPercent: 108 },
        { yPercent: 0, duration: 0.7, ease: "power3.out" },
        0.06
      );
      if (chapterRef.current) {
        tl.fromTo(
          chapterRef.current,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
          0
        );
      }
      if (counterRef.current) {
        tl.fromTo(
          counterRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
          0.18
        );
      }
      if (counterNumRef.current) {
        tl.fromTo(
          counterNumRef.current,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.5, ease: "power3.out" },
          0.18
        );
      }
    },
    { dependencies: [caption, slides], scope: rootRef }
  );

  // Kursor bundar: ikut halus + panah berbalik sesuai sisi pointer.
  // Loop rAF hanya hidup saat kursor tampil/bergerak (hemat saat diam).
  useEffect(() => {
    if (!showControls || isCoarsePointer) return;
    if (prefersReducedMotion()) return;
    const cursor = cursorRef.current;
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    if (!cursor || !l1 || !l2) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.6 });
    gsap.set(l1, {
      transformOrigin: "100% 50%",
      xPercent: -50,
      yPercent: -50,
      y: -1.5,
      rotation: 45,
      x: 0,
    });
    gsap.set(l2, {
      transformOrigin: "100% 50%",
      xPercent: -50,
      yPercent: -50,
      y: 1.5,
      rotation: -45,
      x: 0,
    });

    let currentSide: "left" | "right" = "right";
    let rafId: number | null = null;

    const render = () => {
      const dx = mouse.current.x - pos.current.x;
      const dy = mouse.current.y - pos.current.y;
      pos.current.x += dx * 0.12;
      pos.current.y += dy * 0.12;
      gsap.set(cursor, { x: pos.current.x, y: pos.current.y });
      if (isInside.current || Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };
    const startLoop = () => {
      if (rafId === null) rafId = requestAnimationFrame(render);
    };

    const handleMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const target = e.target instanceof Element ? e.target : null;
      const isOverControls = Boolean(
        target?.closest(
          'button, input, textarea, select, a, label, [role="button"], [contenteditable="true"]'
        )
      );

      mouse.current.x = x;
      mouse.current.y = y;

      const rect = rootRef.current?.getBoundingClientRect();
      const isOut =
        !rect ||
        x <= rect.left ||
        y <= rect.top ||
        x >= rect.right ||
        y >= rect.bottom;

      if (isOut || isOverControls) {
        if (isInside.current) {
          isInside.current = false;
          gsap.to(cursor, {
            opacity: 0,
            scale: 0.6,
            duration: 0.25,
            ease: "power3.inOut",
          });
        }
        startLoop();
        return;
      }

      if (!isInside.current) {
        pos.current.x = x;
        pos.current.y = y;
        gsap.set(cursor, { x, y });
        gsap.to(cursor, {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: "power3.out",
        });
        isInside.current = true;
      }

      const isLeft = rect ? x < rect.left + rect.width / 2 : false;
      const nextSide = isLeft ? "left" : "right";

      if (nextSide !== currentSide) {
        currentSide = nextSide;
        if (nextSide === "left") {
          gsap.to(l1, {
            rotation: 135,
            x: "-1vw",
            duration: 0.35,
            ease: "power3.inOut",
          });
          gsap.to(l2, {
            rotation: -135,
            x: "-1vw",
            duration: 0.35,
            ease: "power3.inOut",
          });
        } else {
          gsap.to(l1, {
            rotation: 45,
            x: 4,
            duration: 0.35,
            ease: "power3.inOut",
          });
          gsap.to(l2, {
            rotation: -45,
            x: 4,
            duration: 0.35,
            ease: "power3.inOut",
          });
        }
      }

      startLoop();
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [showControls, isCoarsePointer]);

  const renderStrips = (slide: ParallaxSlide) => {
    const width = 100 / stripCount;

    return Array.from({ length: stripCount }, (_, i) => (
      <div
        key={i}
        ref={(el) => {
          if (el) stripsRef.current[i] = el;
        }}
        className="absolute inset-y-0 overflow-hidden"
        style={{
          left: `${i * width}%`,
          width: `${width}%`,
          marginLeft: i === 0 ? 0 : "-0.5px",
          paddingLeft: i === 0 ? 0 : "0.5px",
        }}
      >
        <div
          className="absolute inset-y-0"
          style={{
            left: `-${i * 100}%`,
            width: `${stripCount * 100}%`,
          }}
        >
          <div
            ref={(el) => {
              if (el) zoomRef.current[i] = el;
            }}
            className="relative h-full w-full will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- strip reveal butuh <img> mentah; berkas sudah dikompres di /work */}
            <img
              src={slide.src}
              alt=""
              draggable={false}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full select-none object-cover"
            />
          </div>
        </div>
      </div>
    ));
  };

  const activeSlide = slides[caption];
  const stacked = isCoarsePointer;

  if (!slides.length) return null;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={copy.region}
      style={{ backgroundColor }}
      className={`group parallax-strip-slider relative h-full w-full overflow-hidden ${className}`}
    >
      {/* Slide lama, tertutup oleh reveal. */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- slide dasar <img> mentah; berkas sudah dikompres di /work */}
        <img
          src={slides[current].src}
          alt={slides[current].title}
          draggable={false}
          fetchPriority={current === 0 ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
      </div>

      {/* Slide masuk, hanya terpasang saat transisi. */}
      {incoming !== null && (
        <div className="absolute inset-0">{renderStrips(slides[incoming])}</div>
      )}

      {/* Scrim gelap atas/bawah agar teks tetap terbaca di atas foto terang. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-black/60 to-transparent"
      />
      {stacked ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-44 bg-gradient-to-t from-black/60 to-transparent"
        />
      ) : null}
      <div aria-hidden="true" className="photo-veil z-10" />

      {/* Overlay klik: separuh kiri mundur, separuh kanan maju. */}
      {showControls && total > 1 && (
        <div
          className="absolute inset-0 z-20"
          style={{ cursor: stacked ? "pointer" : "none" }}
          onClick={(e) => {
            if (isAnimating.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const isLeft = e.clientX < rect.left + rect.width / 2;
            if (isLeft) onPrev();
            else onNext();
          }}
        />
      )}

      {/* Bilah progres atas. */}
      {showProgressBar && (
        <div
          className="pointer-events-none absolute inset-x-6 top-6 z-10 h-px sm:inset-x-10 sm:top-8"
          style={{ backgroundColor: `${accentColor}33` }}
        >
          <div
            ref={progressRef}
            className="h-full w-full origin-left"
            style={{
              transform: `scaleX(${(caption + 1) / total})`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      )}

      {/* Label babak kiri atas. */}
      <div
        ref={captionRef}
        className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-12 sm:px-10 sm:pt-16"
      >
        <span
          ref={chapterRef}
          className="block truncate text-xs font-medium tracking-wide"
          style={{ color: accentColor }}
        >
          {activeSlide.chapter ??
            `Collection ${String(caption + 1).padStart(2, "0")}`}
        </span>
      </div>

      {/* Bar bawah: judul + tautan detail + penghitung + tombol. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 flex px-6 pb-10 sm:px-10 ${
          stacked ? "flex-col items-stretch gap-4 pb-6" : "items-end"
        }`}
      >
        <div className={stacked ? "order-1 w-full" : "w-[52%] shrink-0"}>
          {/* Sizer tak terlihat menjaga tinggi blok judul setinggi slide
              terpanjang pada lebar apa pun, sehingga bar bawah (link +
              penghitung) tidak bergeser saat slide berganti. Mask
              overflow-hidden membuat judul bisa naik dari baliknya tanpa
              mengubah tata letak. */}
          <div className="grid items-end overflow-hidden pb-[0.14em] -mb-[0.14em]">
            {slides.map((slide, index) => (
              <h2
                key={`${index}-${slide.title}`}
                aria-hidden="true"
                className="invisible col-start-1 row-start-1 font-display text-3xl leading-[1.08] sm:text-5xl sm:leading-[1.05] lg:text-6xl"
                style={{ color: accentColor }}
              >
                {slide.title}
              </h2>
            ))}
            <h2
              ref={titleRef}
              className="pointer-events-none col-start-1 row-start-1 font-display text-3xl leading-[1.08] will-change-transform sm:text-5xl sm:leading-[1.05] lg:text-6xl"
              style={{ color: accentColor }}
            >
              {activeSlide.title}
            </h2>
          </div>
          {activeSlide.href ? (
            <a
              href={activeSlide.href}
              className="focus-ring pointer-events-auto mt-4 inline-flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.14em]"
              style={{ color: accentColor }}
            >
              {copy.view}
              <ArrowIcon />
            </a>
          ) : null}
        </div>

        {!stacked && <div aria-hidden className="flex-1" />}

        {showCounter && (
          <div
            className={`flex shrink-0 items-center ${
              stacked ? "order-2 w-full justify-between" : "justify-end py-1"
            }`}
            style={{ color: `${accentColor}b3` }}
          >
            <span className="pointer-events-none inline-flex items-center text-xs">
              <span className="inline-block w-[2ch] overflow-hidden text-right">
                <span ref={counterNumRef} className="inline-block">
                  {String(caption + 1).padStart(2, "0")}
                </span>
              </span>
              <span> / {String(total).padStart(2, "0")}</span>
            </span>
            {total > 1 && (
              <span className="pointer-events-auto ml-4 inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label={copy.prev}
                  className="focus-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-sm border transition-colors hover:bg-white/10"
                  style={{ borderColor: `${accentColor}59`, color: accentColor }}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  aria-label={copy.next}
                  className="focus-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-sm border transition-colors hover:bg-white/10"
                  style={{ borderColor: `${accentColor}59`, color: accentColor }}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Kursor bundar navigasi (desktop). */}
      {showControls && total > 1 && !isCoarsePointer && (
        <div
          ref={cursorRef}
          className="pointer-events-none fixed left-0 top-0 z-[100]"
        >
          <div
            className="flex size-15 items-center justify-center rounded-full"
            style={{ backgroundColor: accentColor }}
          >
            <div className="relative size-7.5">
              <span
                ref={line1Ref}
                className="absolute left-1/2 top-1/2 h-0.5 w-4"
                style={{ backgroundColor: "#000000" }}
              />
              <span
                ref={line2Ref}
                className="absolute left-1/2 top-1/2 h-0.5 w-4"
                style={{ backgroundColor: "#000000" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
