"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { cn } from "@/lib/utils";

export type Region = { x: number; y: number; w: number; h: number };

export type Feature = {
  title: string;
  body: string;
  // Di mana fitur ini berada pada mock: nilai `data-spot` sebuah elemen di
  // dalamnya, diukur dari tata letak nyata sehingga sorotan tidak pernah
  // melenceng dari yang dibingkainya. Untuk <img>, berikan `region` dalam
  // piksel desain mock (lihat `screenshotSize`).
  spot?: string;
  region?: Region;
};

// Offset mengabaikan transform, jadi ini membaca piksel desain seberapa pun
// mock diperkecil atau di-zoom. `root` harus diposisikan agar rantai offset
// berakhir di sana.
function measureSpot(root: HTMLElement, spot: string): Region | null {
  const el = root.querySelector<HTMLElement>(`[data-spot="${spot}"]`);
  if (!el) return null;
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// Gerakan kamera itu menjelaskan, bukan umpan balik UI: cukup lambat agar
// mata bisa mengikuti pan dan melihat ke mana pada produk ia mendarat.
const CAMERA = { type: "spring", duration: 0.8, bounce: 0 } as const;
// Ruang di sekitar region saat kamera membingkainya, dalam piksel desain.
const PAD = 18;
// Lewat ini mock berubah jadi buram-buram beberapa kata.
const MAX_ZOOM = 2.2;
// Seberapa jauh di atas fitur pertama, atau di bawah yang terakhir, garis
// baca boleh berkelana sebelum kamera menarik mundur.
const CATCH = 28;
// Ruang tambahan setelah ujung seksi komponen: catatan contoh + CTA + padding
// kartu induk masih terlihat saat pengunjung "mencapai dasar" — sorotan
// langkah terakhir tidak boleh dilepas selama kartu itu masih terbaca.
const EXIT_TRAIL = 180;
// Sudut lubang sorotan memakai radius kartu situs (rounded-md 6px) supaya
// konsisten dengan kartu di dalam mock (R22b; sebelumnya 12px).
const HOLE_RADIUS = 6;

type ScrollRoot = React.RefObject<HTMLElement | null> | "window";

/** useLayoutEffect aman-SSR (server memakai useEffect). */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Sorotan fitur: mock tetap di tempatnya, kamera bergerak menyorot tiap
 * bagian saat pengunjung menggulir daftar fiturnya. Mock digambar pada
 * ukuran desain dan diperkecil seperti tangkapan layar, jadi saat di-zoom
 * tetap tajam. `data-spot` membuat sorotan selalu sepakat dengan tata letak
 * nyata mock — bukan koordinat yang ditulis tangan.
 */
export function FeatureSpotlight({
  features,
  screenshot,
  screenshotSize,
  scrollRoot = "window",
  labels,
  className,
}: {
  features: Feature[];
  // UI produk (atau <img>) yang digambar pada `screenshotSize` piksel desain
  // lalu diperkecil agar pas. Bangun besar dengan ukuran teks nyata supaya
  // tetap tajam saat di-zoom.
  screenshot: React.ReactNode;
  screenshotSize: { width: number; height: number };
  // Apa yang menggulir bagian ini: window di halaman asli, atau elemen
  // (seperti mock halaman) yang diberikan sebagai ref.
  scrollRoot?: ScrollRoot;
  labels: { region: string; showing: string };
  className?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Klik menggulir fitur ke tempatnya; sampai guliran itu mengendap, fitur
  // yang lewat tidak boleh mencuri kamera.
  const lockedUntil = useRef(0);
  const [stickyTop, setStickyTop] = useState(24);

  // Membaca tata letak saat menggulir dan hanya set state ketika fitur yang
  // disorot berganti, jadi menggulir tidak merender tiap frame.
  useEffect(() => {
    const target: HTMLElement | Window =
      scrollRoot === "window" ? window : (scrollRoot.current ?? window);
    let frame = 0;

    const viewport = () =>
      target === window
        ? { top: 0, bottom: window.innerHeight }
        : (target as HTMLElement).getBoundingClientRect();

    const measure = () => {
      frame = 0;
      if (performance.now() < lockedUntil.current) return;
      const view = viewport();
      const list = listRef.current?.getBoundingClientRect();
      const stage = stageRef.current?.getBoundingClientRect();
      const section = sectionRef.current?.getBoundingClientRect();
      if (!list || !stage || !section) return;
      // Berdampingan, garis baca adalah tengah viewport. Bertumpuk, mock
      // menempel di atas, jadi garis bacanya adalah tengah sisa ruang.
      const stacked = stage.left < list.right - 1;
      const top = stacked ? Math.max(view.top, stage.bottom) : view.top;
      const line = (top + view.bottom) / 2;
      const els = textRefs.current;
      const first = els[0]?.getBoundingClientRect();
      // Sebelum fitur pertama: kamera menarik mundur (ikhtisar singkat).
      // Sesudah seluruh seksi lewat: kamera juga menarik mundur. Di antara
      // keduanya garis baca SELALU terpetakan ke sebuah langkah — memakai
      // pita antar titik tengah fitur — sehingga saat pengunjung mencapai
      // dasar seksi, langkah terakhir tetap presisi (bukan jatuh ke
      // ikhtisar lebih awal).
      const entered = !!first && line >= first.top - CATCH;
      const exited = line > section.bottom + EXIT_TRAIL;
      if (!entered || exited) {
        setActive(null);
        return;
      }
      let found = 0;
      let best = Infinity;
      els.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const d = Math.abs(line - mid);
        if (d < best) {
          best = d;
          found = i;
        }
      });
      setActive(found);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onResize = () => {
      const view = viewport();
      const stage = stageRef.current;
      if (stage) {
        // Memusatkan mock yang menempel di viewport saat berdampingan.
        setStickyTop(
          Math.max(16, (view.bottom - view.top - stage.offsetHeight) / 2)
        );
      }
      onScroll();
    };

    onResize();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    if (target !== window) ro.observe(target as HTMLElement);
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [scrollRoot]);

  const select = (i: number, now: number) => {
    const el = textRefs.current[i];
    const root = scrollRoot === "window" ? null : scrollRoot.current;
    if (!el) return;
    setActive(i);
    const view = root
      ? root.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };
    const list = listRef.current?.getBoundingClientRect();
    const stage = stageRef.current?.getBoundingClientRect();
    const stacked = !!list && !!stage && stage.left < list.right - 1;
    // Di mana mock yang menempel akan duduk setelah digulir, bukan di mana
    // ia sekarang.
    const top = stacked ? view.top + (stage?.height ?? 0) : view.top;
    const line = (top + view.bottom) / 2;
    const r = el.getBoundingClientRect();
    const delta = r.top + r.height / 2 - line;
    lockedUntil.current = now + (reduceMotion ? 50 : 900);
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    if (root) root.scrollBy({ top: delta, behavior });
    else window.scrollBy({ top: delta, behavior });
  };

  return (
    // Ditata oleh lebarnya sendiri, bukan lebar viewport, jadi ini bekerja
    // di dalam kolom maupun full-bleed.
    <section
      ref={sectionRef}
      aria-label={labels.region}
      className={cn("@container relative w-full pb-10", className)}
    >
      <div className="grid grid-cols-1 gap-x-7 @[34rem]:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="sticky top-16 z-10 bg-canvas pt-3 pb-4 @[34rem]:order-2 @[34rem]:self-start @[34rem]:bg-transparent @[34rem]:p-0 @[34rem]:[top:var(--sticky-top)]"
          style={{ "--sticky-top": `${stickyTop}px` } as React.CSSProperties}
        >
          <div ref={stageRef}>
            <Stage
              size={screenshotSize}
              feature={active === null ? null : features[active]}
              reduceMotion={reduceMotion}
            >
              {screenshot}
            </Stage>
          </div>
        </div>

        <ol ref={listRef} className="flex flex-col @[34rem]:order-1">
          {features.map((feature, i) => {
            const on = active === i;
            return (
              // Cukup udara untuk membaca satu fitur pada satu waktu.
              <li
                key={feature.title}
                className="py-8 first:pt-4 last:pb-16 @[34rem]:first:pt-6"
              >
                <div ref={(el) => void (textRefs.current[i] = el)}>
                  <button
                    type="button"
                    // Waktu event berbagi jam dengan performance.now().
                    onClick={(e) => select(i, e.timeStamp)}
                    aria-pressed={on}
                    className="focus-ring group relative flex w-full touch-manipulation flex-col items-start gap-2 rounded-md py-1 pl-4 text-left transition-[scale] duration-150 ease-out active:scale-[0.96]"
                  >
                    {/* Rel di samping tiap fitur: yang menyala adalah yang
                        sedang ditampilkan mock. */}
                    <span
                      aria-hidden
                      className="absolute top-1 bottom-1 left-0 w-0.5 overflow-hidden rounded-full bg-line"
                    >
                      <span
                        className={cn(
                          "block size-full origin-top rounded-full bg-ink transition-[scale] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                          on ? "scale-y-100" : "scale-y-0"
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "text-[13px] font-semibold tracking-[0.14em] tabular-nums transition-colors duration-300 ease-out",
                        on ? "text-ink" : "text-ink-3"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[17px] leading-snug font-semibold text-balance transition-colors duration-300 ease-out",
                        on ? "text-ink" : "text-ink-3 group-hover:text-ink"
                      )}
                    >
                      {feature.title}
                    </span>
                    <span
                      className={cn(
                        "text-sm leading-relaxed text-pretty text-ink-2 transition-opacity duration-300 ease-out",
                        on ? "opacity-100" : "opacity-70"
                      )}
                    >
                      {feature.body}
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="sr-only" aria-live="polite">
        {active === null
          ? ""
          : labels.showing.replace("{title}", features[active].title)}
      </p>
    </section>
  );
}

function Stage({
  size,
  feature,
  reduceMotion,
  children,
}: {
  size: { width: number; height: number };
  feature: Feature | null;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.5);
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const camScale = useMotionValue(1);
  const holeX = useMotionValue(0);
  const holeY = useMotionValue(0);
  const holeW = useMotionValue(size.width);
  const holeH = useMotionValue(size.height);
  const dim = useMotionValue(0);
  const transform = useMotionTemplate`translate(${camX}px, ${camY}px) scale(${camScale})`;
  const running = useRef<AnimationPlaybackControls[]>([]);

  // Mock digambar pada ukuran desainnya lalu diperkecil ke bingkai.
  useIsoLayoutEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFit(el.offsetWidth / size.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [size.width]);

  useEffect(() => {
    running.current.forEach((a) => a.stop());
    const shot = shotRef.current;
    const region =
      feature && shot && feature.spot
        ? measureSpot(shot, feature.spot)
        : (feature?.region ?? null);
    const W = size.width;
    const H = size.height;
    let zoom = 1;
    let x = 0;
    let y = 0;
    let hole: Region = { x: 0, y: 0, w: W, h: H };
    if (region) {
      hole = {
        x: region.x - 6,
        y: region.y - 6,
        w: region.w + 12,
        h: region.h + 12,
      };
      zoom = Math.min(
        W / (region.w + PAD * 2),
        H / (region.h + PAD * 2),
        MAX_ZOOM
      );
      // Memusatkan region, tapi tidak pernah menggeser melewati tepi mock.
      const cx = region.x + region.w / 2;
      const cy = region.y + region.h / 2;
      x = Math.min(0, Math.max(W - W * zoom, W / 2 - cx * zoom));
      y = Math.min(0, Math.max(H - H * zoom, H / 2 - cy * zoom));
    }
    const pairs: [typeof camX, number][] = [
      [camX, x * fit],
      [camY, y * fit],
      [camScale, zoom],
      [holeX, hole.x],
      [holeY, hole.y],
      [holeW, hole.w],
      [holeH, hole.h],
    ];
    if (reduceMotion) {
      // Tanpa perjalanan kamera: hanya sorotan yang menunjuk region.
      pairs.forEach(([mv], i) => i > 2 && mv.jump(pairs[i][1]));
      camX.jump(0);
      camY.jump(0);
      camScale.jump(1);
      running.current = [animate(dim, region ? 1 : 0, { duration: 0.2 })];
      return;
    }
    running.current = [
      ...pairs.map(([mv, to]) => animate(mv, to, CAMERA)),
      // Redup memimpin saat masuk dan menyusul saat keluar, jadi penarikan
      // mundur terbaca sebagai lampu ruangan yang menyala setelah kamera
      // pergi.
      animate(dim, region ? 1 : 0, {
        duration: region ? 0.35 : 0.5,
        delay: region ? 0.15 : 0,
        ease: [0.23, 1, 0.32, 1],
      }),
    ];
  }, [
    feature,
    fit,
    size.width,
    size.height,
    reduceMotion,
    camX,
    camY,
    camScale,
    holeX,
    holeY,
    holeW,
    holeH,
    dim,
  ]);

  useEffect(() => () => running.current.forEach((a) => a.stop()), []);

  return (
    <figure className="overflow-hidden rounded-md border border-line bg-canvas">
      <div className="flex h-7 items-center gap-1.5 border-b border-line bg-surface px-3">
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
        <span className="size-2 rounded-full bg-line" />
      </div>
      <div
        ref={viewRef}
        className="relative overflow-hidden"
        style={{ aspectRatio: `${size.width} / ${size.height}` }}
      >
        <motion.div
          className="absolute top-0 left-0 origin-top-left"
          style={{ transform }}
        >
          <div
            ref={shotRef}
            // Diposisikan, jadi spot yang diukur menjumlahkan offset-nya ke
            // sini.
            className="relative origin-top-left"
            style={{
              width: size.width,
              height: size.height,
              scale: String(fit),
            }}
          >
            {children}
            {/* Sorotannya: lubang membulat yang bayangannya yang sangat
                besar meredupkan sisanya. Ukurannya lewat width/height, bukan
                scale, agar sudutnya tetap membulat. */}
            <motion.div
              data-spot-hole
              className="pointer-events-none absolute top-0 left-0"
              style={{
                x: holeX,
                y: holeY,
                width: holeW,
                height: holeH,
                opacity: dim,
                borderRadius: HOLE_RADIUS,
                boxShadow:
                  "0 0 0 2px color-mix(in oklab, var(--foreground) 22%, transparent), 0 0 0 2000px color-mix(in oklab, var(--canvas) 70%, transparent)",
              }}
            />
          </div>
        </motion.div>
      </div>
    </figure>
  );
}
