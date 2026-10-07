"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { initGsap, prefersReducedMotion } from "@/lib/motion";
import { MediaImage } from "@/components/ui/media-image";

const emptySubscribe = () => () => {};

/**
 * Portal penampil foto ke `document.body` (R19f): seksi galeri adalah target
 * animasi reveal yang menyimpan `transform` — tanpa portal, plate `fixed`
 * penampil terjebak di stacking context seksi sehingga navbar tampil di
 * atasnya. Portal membuat penampil benar-benar berada di atas segalanya.
 */
function ViewerPortal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export type GalleryViewItem = {
  src: string;
  alt: string;
  role: "render" | "foto_lapangan";
  order: number;
  type: "foto" | "video";
  poster?: string;
  /** Atribusi sumber berkas (mis. "Arsip RR Design & Build"). */
  credit?: string;
};

export type GalleryLabels = {
  render: string;
  site: string;
  video: string;
  viewer: string;
  close: string;
  prev: string;
  next: string;
  /** Template dengan {n} dan {total}. */
  counter: string;
  /** Template untuk video dengan {n} dan {total}. */
  videoCounter: string;
  /** Label sebelum teks kredit sumber (mis. "Sumber"). */
  credit: string;
};

/**
 * Galeri foto responsif + lightbox dengan navigasi papan ketik.
 * - Klik foto membuka penampil; Escape menutup; panah kiri/kanan berpindah.
 * - Sejak R15i penampil masuk dan keluar dengan animasi halus (fade +
 *   skala tipis, hormat reduced-motion) dan hanya bisa ditutup lewat
 *   tombol X atau Escape — klik di luar tidak menutup.
 * - Fokus terkurung di dalam dialog dan kembali ke tombol asal saat ditutup.
 * - Gulir halaman terkunci selama penampil terbuka; kontrol >= 44px.
 * Penampil selalu gelap (plate media) agar foto menjadi fokus; cincin fokus
 * di dalamnya memakai krem piring (arsitektur §2.4 no. 6), bukan warna
 * fokus mode halaman.
 */
export function ProjectGallery({
  items,
  labels,
}: {
  items: GalleryViewItem[];
  labels: GalleryLabels;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const isOpen = openIndex !== null;
  // Lapisan media (maks 2): lapisan lama bertahan sampai lapisan baru
  // selesai dimuat, lalu bertukar dengan transisi berarah — tidak pernah
  // ada bingkai kosong dan dialog tidak ikut memudar ulang.
  const [layers, setLayers] = useState<{ id: number; index: number; dir: number }[]>([]);
  const nextLayerId = useRef(1);
  const layerEls = useRef(new Map<number, HTMLDivElement>());
  const swapped = useRef(new Set<number>());
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  // R12: referensi tombol chevron untuk pemindahan fokus di ujung dek.
  const prevBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  const pauseVideos = useCallback(() => {
    dialogRef.current
      ?.querySelectorAll("video")
      .forEach((video) => video.pause());
  }, []);

  const runSwap = useCallback(
    (layerId: number) => {
      // Lapisan pertama (saat membuka) tidak perlu animasi tukar.
      if (layers.length < 2) return;
      if (swapped.current.has(layerId)) return;
      swapped.current.add(layerId);
      const idx = layers.findIndex((layer) => layer.id === layerId);
      if (idx < 0) return;
      const layer = layers[idx];
      const el = layerEls.current.get(layerId);
      const prev = idx > 0 ? layerEls.current.get(layers[idx - 1].id) : null;
      if (!el || prefersReducedMotion()) {
        if (prev) gsap.set(prev, { autoAlpha: 0 });
        setLayers((current) => current.slice(-1));
        return;
      }
      const tl = gsap.timeline({
        onComplete: () => setLayers((current) => current.slice(-1)),
      });
      tl.fromTo(
        el,
        { autoAlpha: 0, x: layer.dir * 44 },
        { autoAlpha: 1, x: 0, duration: 0.38, ease: "power3.out" },
        0
      );
      if (prev) {
        tl.to(
          prev,
          {
            autoAlpha: 0,
            x: layer.dir * -28,
            duration: 0.38,
            ease: "power3.out",
          },
          0
        );
      }
    },
    [layers]
  );

  // Lapisan teratas siap (termasuk gambar dari cache yang tidak memicu
  // onLoad): periksa sekali per frame, dengan pengaman waktu agar video
  // lambat/bermasalah tidak pernah menyangkut.
  useEffect(() => {
    if (layers.length < 2) return;
    const layer = layers[layers.length - 1];
    const raf = requestAnimationFrame(() => {
      const el = layerEls.current.get(layer.id);
      const img = el?.querySelector("img");
      const video = el?.querySelector("video");
      const ready = video
        ? video.readyState >= 2
        : Boolean(img && img.complete && img.naturalWidth > 0);
      if (ready) runSwap(layer.id);
    });
    const fallback = window.setTimeout(() => runSwap(layer.id), 1800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [layers, runSwap]);

  // Hangatkan tetangga (foto) agar chevron terasa seketika — tanpa
  // putaran: di ujung dek cukup satu tetangga (R12).
  useEffect(() => {
    if (openIndex === null) return;
    for (const step of [1, -1]) {
      const target = openIndex + step;
      if (target < 0 || target >= items.length) continue;
      const item = items[target];
      if (item && item.type === "foto") {
        const img = new window.Image();
        img.decoding = "async";
        img.src = item.src;
      }
    }
  }, [openIndex, items]);

  // Animasi masuk penampil — HANYA saat dibuka, bukan tiap ganti foto;
  // transisi antar-foto ditangani lapisan media (tidak ada kedip dialog).
  const opened = useRef(false);
  useGSAP(
    () => {
      initGsap();
      if (!isOpen) {
        opened.current = false;
        return;
      }
      if (opened.current || prefersReducedMotion()) return;
      opened.current = true;
      if (dialogRef.current) {
        gsap.fromTo(
          dialogRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.22, ease: "power1.out" }
        );
      }
      if (mediaRef.current) {
        gsap.fromTo(
          mediaRef.current,
          { scale: 0.97 },
          {
            scale: 1,
            duration: 0.3,
            ease: "power3.out",
            clearProps: "transform",
          }
        );
      }
    },
    { dependencies: [isOpen] }
  );

  const close = useCallback(() => {
    pauseVideos();
    setOpenIndex(null);
    setLayers([]);
    swapped.current.clear();
    triggerRef.current?.focus();
  }, [pauseVideos]);

  const step = useCallback(
    (delta: number) => {
      if (openIndex === null) return;
      // Abaikan klik/ketuk beruntun selama transisi masih berjalan.
      if (layers.length > 1) return;
      // R12: batas tegas tanpa putaran — di foto pertama "kiri" dan di foto
      // terakhir "kanan" tidak melakukan apa pun (tombolnya juga nonaktif).
      const target = openIndex + delta;
      if (target < 0 || target >= items.length) return;
      pauseVideos();
      setOpenIndex(target);
      setLayers((current) => [
        ...current,
        { id: nextLayerId.current++, index: target, dir: delta },
      ]);
      // Jangan biarkan fokus hilang saat tombol yang dipakai menjadi
      // nonaktif di ujung: pindahkan ke tombol lawan (tanpa menggeser gulir).
      if (target === 0 || target === items.length - 1) {
        requestAnimationFrame(() => {
          if (document.activeElement !== document.body) return;
          if (target === items.length - 1) {
            prevBtnRef.current?.focus({ preventScroll: true });
          } else {
            nextBtnRef.current?.focus({ preventScroll: true });
          }
        });
      }
    },
    [openIndex, layers, items.length, pauseVideos]
  );

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowLeft") {
        if (event.target instanceof HTMLVideoElement) return;
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        if (event.target instanceof HTMLVideoElement) return;
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "Tab") {
        const focusables =
          dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, step]);

  const current = openIndex === null ? null : items[openIndex];
  const counter =
    openIndex === null
      ? ""
      : (current?.type === "video" ? labels.videoCounter : labels.counter)
          .replace("{n}", String(openIndex + 1))
          .replace("{total}", String(items.length));

  const roleLabel = (role: GalleryViewItem["role"]) =>
    role === "render" ? labels.render : labels.site;

  const controlClass =
    "focus-ring inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#FFFCEF]/30 bg-primary text-primary-ink transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-35";

  return (
    <>
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                nextLayerId.current = 1;
                swapped.current.clear();
                setLayers([{ id: 0, index, dir: 1 }]);
                setOpenIndex(index);
              }}
              className="focus-ring group block w-full cursor-zoom-in"
            >
              <figure className="relative aspect-[4/5] overflow-hidden rounded-md bg-subtle">
                {item.type === "video" && !item.poster ? (
                  // Poster opsional (skema media): video tanpa poster tampil
                  // sebagai permukaan netral + teks alternatif, bukan gambar rusak.
                  <span className="sr-only">{item.alt}</span>
                ) : (
                  <MediaImage
                    src={
                      item.type === "video"
                        ? (item.poster ?? item.src)
                        : item.src
                    }
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition-[scale] duration-200 motion-reduce:transition-none group-hover:scale-[1.02]"
                  />
                )}
                {item.type === "video" ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-plate/85 text-plate-ink">
                      <svg
                        aria-hidden="true"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                      </svg>
                    </span>
                  </span>
                ) : null}
                <span aria-hidden="true" className="photo-veil" />
                <span className="label-plate absolute left-3 top-3">
                  {item.type === "video" ? labels.video : roleLabel(item.role)}
                </span>
                <span className="label-plate absolute right-3 top-3">
                  /{String(item.order).padStart(2, "0")}
                </span>
              </figure>
            </button>
          </li>
        ))}
      </ul>

      <ViewerPortal>
      <AnimatePresence>
        {isOpen && current ? (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.viewer}
            className="plate-scope fixed inset-0 z-[60] flex flex-col bg-plate/95"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    opacity: 0,
                    scale: 0.99,
                    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
                  }
            }
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="label-plate">
                  {current.type === "video"
                    ? labels.video
                    : roleLabel(current.role)}
                </span>
                <span className="label-plate">
                  /{String(current.order).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  aria-live="polite"
                  className="text-sm text-plate-ink"
                >
                  {counter}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label={labels.close}
                  className={controlClass}
                >
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 sm:px-16">
              <button
                ref={prevBtnRef}
                type="button"
                onClick={() => {
                  step(-1);
                }}
                aria-label={labels.prev}
                disabled={openIndex === 0}
                className={`${controlClass} absolute left-2 top-1/2 z-10 -translate-y-1/2 sm:left-4`}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <div
                ref={mediaRef}
                className="relative h-full w-full max-w-5xl"
              >
                {layers.map((layer, layerIndex) => {
                  const item = items[layer.index];
                  const isTop = layerIndex === layers.length - 1;
                  return (
                    <div
                      key={layer.id}
                      ref={(el) => {
                        if (el) layerEls.current.set(layer.id, el);
                        else layerEls.current.delete(layer.id);
                      }}
                      aria-hidden={!isTop ? "true" : undefined}
                      className="absolute inset-0"
                      style={{ zIndex: layerIndex }}
                    >
                      {item.type === "video" ? (
                        <video
                          src={item.src}
                          poster={item.poster}
                          controls
                          preload="metadata"
                          playsInline
                          aria-label={item.alt}
                          onLoadedData={() => runSwap(layer.id)}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <MediaImage
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes="(min-width: 1024px) 1024px, 100vw"
                          className="object-contain"
                          onLoad={() => runSwap(layer.id)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                ref={nextBtnRef}
                type="button"
                onClick={() => {
                  step(1);
                }}
                aria-label={labels.next}
                disabled={openIndex === items.length - 1}
                className={`${controlClass} absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-4`}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            <div
              className="space-y-1 px-4 pb-4 text-center text-xs text-plate-ink/70 sm:pb-6"
            >
              <p>{current.alt}</p>
              {current.credit ? (
                <p>
                  {labels.credit}: {current.credit}
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </ViewerPortal>
    </>
  );
}
