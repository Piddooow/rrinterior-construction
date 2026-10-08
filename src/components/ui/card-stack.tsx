"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

export type StackCard = {
  src: string;
  alt: string;
  title: string;
  role: string | null;
};

/**
 * Jendela kartu yang digambar. Referensi Stack dirancang untuk 4–6 kartu
 * (rotasi 4°/kedalaman); arsip RR berisi 20 foto, jadi hanya jendela teratas
 * yang dirender dan sisanya menunggu di belakang — kipasnya tetap persis,
 * tanpa 20 gambar sekaligus.
 */
const VISIBLE = 6;
// Pegas kemiringan 3D: redaman hampir kritis (ζ≈0.95) — kartu mengikuti
// pointer dengan licin dan kembali TANPA mantul saat dilepas.
const TILT_SPRING = { type: "spring" as const, stiffness: 320, damping: 34 };
// Abaikan klik yang sebenarnya adalah akhir dari tarikan (drag).
const CLICK_AFTER_DRAG_MS = 160;
// Kirim ke belakang (R10c): SATU gerakan kontinu. Kartu teratas mulai
// meluncur ke slot belakang sejak t=0; kipas menyusul 120ms kemudian dan
// keduanya SELESAI bersamaan di SEND_MS dengan kurva yang sama. Kartu
// mendarat dengan geometri slot tujuan (termasuk kemiringan acak kartu
// penggantinya) sehingga commit urutan terjadi tanpa perubahan apa pun
// yang terlihat — mulus, tanpa pegas mantul. Tuck = momen lapisan kartu
// turun ke bawah tumpukan (saat sudah hampir tiba di slotnya).
const SEND_MS = 560;
const SEND_FAN_DELAY_MS = 120;
const SEND_FAN_MS = SEND_MS - SEND_FAN_DELAY_MS;
const SEND_TUCK_MS = 240;
const SEND_EASE = [0.22, 1, 0.36, 1] as const;

/** Rotasi "acak" yang deterministik per kartu (stabil lintas render/SSR). */
function jitter(seed: string, randomRotation: boolean) {
  if (!randomRotation) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return ((Math.abs(h) % 1000) / 1000) * 10 - 5;
}

function StackLayer({
  item,
  depth,
  landingDepth,
  landingJitter,
  isTop,
  sending,
  phase,
  shiftNow,
  reduceMotion,
  randomRotation,
  sensitivity,
  label,
  hint,
  clickEnabled,
  onRequestSend,
}: {
  item: StackCard;
  depth: number;
  /** Kedalaman slot belakang tempat kartu ini mendarat saat dikirim. */
  landingDepth: number;
  /** Kemiringan acak KARTU PENGGANTI di slot itu — supaya kartu yang
   *  dikirim mendarat persis di geometri kartu yang menggantikannya. */
  landingJitter: number;
  isTop: boolean;
  sending: boolean;
  phase: "carry" | "shift" | "tuck" | null;
  /** Kartu lain: true begitu kipas mulai bergeser (fase shift) — targetnya
   *  sudah kedalaman barunya, jadi commit urutan tidak menggerakkannya lagi. */
  shiftNow: boolean;
  reduceMotion: boolean;
  randomRotation: boolean;
  sensitivity: number;
  label: string;
  hint: string;
  clickEnabled: boolean;
  onRequestSend: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateXRaw = useTransform(y, [-100, 100], [60, -60]);
  const rotateYRaw = useTransform(x, [-100, 100], [-60, 60]);
  // Kemiringan 3D dilewatkan pegas: mengikuti pointer dengan licin, dan
  // melunak saat pointer berhenti — bukan lagi pemetaan linear mentah.
  const rotateX = useSpring(rotateXRaw, TILT_SPRING);
  const rotateY = useSpring(rotateYRaw, TILT_SPRING);
  const lastDrag = useRef(0);
  const press = useRef({ x: 0, y: 0, t: 0 });
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    axis: "x" | "y" | null;
  } | null>(null);

  const settleTilt = () => {
    animate(x, 0, TILT_SPRING);
    animate(y, 0, TILT_SPRING);
  };

  // Kirim ke belakang (R10c): kartu diberi momentum singkat ke arah tarikan
  // (hanya terasa saat datang dari drag; klik biasa langsung meluncur),
  // lalu kembali ke tengah selama SEND_MS — satu tarikan napas dengan kipas
  // yang bergeser, menutup di SEND_MS juga. Urutan deck baru di-commit oleh
  // induk tepat saat geometrinya sudah sama.
  useEffect(() => {
    if (!sending) return;
    const fromX = x.get();
    const fromY = y.get();
    animate(x, [fromX, fromX * 1.08, 0], {
      duration: SEND_MS / 1000,
      times: [0, 0.18, 1],
      ease: SEND_EASE,
    });
    animate(y, [fromY, fromY * 1.06, 0], {
      duration: SEND_MS / 1000,
      times: [0, 0.18, 1],
      ease: SEND_EASE,
    });
  }, [sending, x, y]);

  // Gestur swipe sendiri (R7c): `touch-action: pan-y` menjaga gulir vertikal
  // ponsel tetap milik peramban, sementara gerakan horizontal datang ke kita.
  // Kunci arah ditentukan dari gerakan pertama; tarikan vertikal hanya
  // mengelastis sedikit lalu kembali, tidak pernah mengirim kartu.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (sending) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Titik tekan untuk membedakan ketukan dari gestur (dipakai handleClick).
    press.current = { x: event.clientX, y: event.clientY, t: Date.now() };
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    if (!g.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (g.axis !== "x") return;
    lastDrag.current = Date.now();
    x.set(dx);
    y.set(dy * 0.35);
  };

  const endGesture = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (cancelled || g.axis !== "x") {
      settleTilt();
      return;
    }
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    // Ambang lebih pendek di lebar ponsel supaya swipe terasa ringan.
    const need = window.innerWidth < 768 ? 96 : sensitivity;
    if (Math.abs(dx) > need && Math.abs(dx) > Math.abs(dy)) {
      lastDrag.current = Date.now();
      onRequestSend();
      return;
    }
    settleTilt();
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!clickEnabled || sending) return;
    if (Date.now() - lastDrag.current < CLICK_AFTER_DRAG_MS) return;
    // Gerakan pointer sejak TEKANAN BARU > 6px = gestur (drag/gulir), bukan
    // klik. Klik tanpa tekanan baru (mis. programatik) tidak diukur.
    const fresh = Date.now() - press.current.t < 900;
    const dx = event.clientX - press.current.x;
    const dy = event.clientY - press.current.y;
    if (fresh && Math.hypot(dx, dy) > 6) return;
    onRequestSend();
  };

  const interactive = isTop && !sending;
  // Kartu lain sudah menuju kedalaman barunya sejak fase shift, jadi saat
  // commit urutan tidak ada satu pun kartu yang berubah target — tanpa lompatan.
  const targetDepth = sending ? landingDepth : shiftNow ? depth - 1 : depth;
  // Kartu yang dikirim mendarat di geometri slot tujuan (kemiringan acak
  // kartu pengganti), bukan kemiringan dirinya — pertukaran commit tak terlihat.
  const targetRotateZ = sending
    ? landingDepth * 4 + landingJitter
    : targetDepth * 4 + jitter(item.src, randomRotation);
  const targetScale = 1 - targetDepth * 0.06;
  const zIndex = sending && phase === "tuck" ? 100 - landingDepth : 100 - depth;

  return (
    <motion.div
      data-stack-top={isTop && !sending ? "" : undefined}
      aria-hidden={isTop ? undefined : "true"}
      className="card-rotate will-change-transform"
      style={{ x, y, zIndex, rotateX, rotateY, touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => endGesture(event, false)}
      onPointerCancel={(event) => endGesture(event, true)}
      onClick={handleClick}
    >
      <motion.div
        className={cn(
          "stack-card group focus-ring cursor-grab active:cursor-grabbing",
          interactive && "cursor-pointer"
        )}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? label : undefined}
        onKeyDown={
          interactive
            ? (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onRequestSend();
              }
            : undefined
        }
        animate={{
          rotateZ: targetRotateZ,
          scale: targetScale,
          transformOrigin: "90% 90%",
        }}
        initial={false}
        transition={
          reduceMotion
            ? { duration: 0 }
            : sending
              ? { duration: SEND_MS / 1000, ease: SEND_EASE }
              : { duration: SEND_FAN_MS / 1000, ease: SEND_EASE }
        }
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          draggable={false}
          sizes="(min-width: 1024px) 300px, 70vw"
          className="pointer-events-none object-cover select-none"
        />
        <span aria-hidden="true" className="photo-veil" />
        {item.role ? (
          <span className="label-plate absolute left-3 top-3">
            {item.role}
          </span>
        ) : null}
      </motion.div>
      {isTop ? <span className="sr-only">{hint}</span> : null}
    </motion.div>
  );
}

/**
 * Dek foto arsip bergaya referensi Stack ReactBits: kartu bertumpuk dengan
 * kipas `rotateZ = kedalaman × 4°` + rotasi acak deterministik, skala
 * menurun 6% per kedalaman, **tarikan horizontal melewati `sensitivity` px
 * mengirim kartu ke belakang** (kurang dari itu kembali ke tempatnya), dan
 * klik juga mengirim kartu ke belakang (`sendToBackOnClick`) persis
 * referensi.
 *
 * Sejak R7 swipe hidup di semua perangkat: drag terkunci arah dengan
 * `touch-action: pan-y` sehingga gulir vertikal halaman tetap natural dan
 * tarikan vertikal selalu kembali; tap dan keyboard tetap bekerja.
 *
 * Sejak R10c kirim ke belakang dianimasikan (momentum singkat → meluncur ke
 * slot belakang), lalu disempurnakan: kartu dan seluruh kipas bergerak
 * BARENGAN dalam satu kurva, kartu mendarat di geometri slot tujuan, dan
 * commit urutan terjadi tanpa perubahan yang terlihat — mulus tanpa pegas
 * mantul. Reduced-motion tetap instan.
 */
export function CardStack({
  items,
  labels,
  className,
  randomRotation = true,
  sensitivity = 180,
  sendToBackOnClick = true,
}: {
  items: StackCard[];
  labels: { region: string; hint: string };
  className?: string;
  randomRotation?: boolean;
  sensitivity?: number;
  sendToBackOnClick?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  // Tumpukan indeks item; ELEMEN TERAKHIR = kartu teratas (semantik referensi).
  const [stack, setStack] = useState<number[]>(() => items.map((_, i) => i));
  const [sending, setSending] = useState<{
    index: number;
    phase: "carry" | "shift" | "tuck";
  } | null>(null);
  const sendingRef = useRef<number | null>(null);
  const sendTimers = useRef<number[]>([]);

  const clearSendTimers = useCallback(() => {
    for (const id of sendTimers.current) window.clearTimeout(id);
    sendTimers.current = [];
  }, []);

  const sendToBack = useCallback((itemIndex: number) => {
    setStack((prev) => {
      const pos = prev.indexOf(itemIndex);
      if (pos === -1 || prev.length < 2) return prev;
      const next = [...prev];
      const [card] = next.splice(pos, 1);
      next.unshift(card);
      return next;
    });
  }, []);

  // Kirim ke belakang dengan animasi bertahap; reduced-motion langsung.
  const beginSend = useCallback(
    (itemIndex: number) => {
      if (reduceMotion) {
        sendToBack(itemIndex);
        return;
      }
      if (sendingRef.current !== null) return;
      sendingRef.current = itemIndex;
      setSending({ index: itemIndex, phase: "carry" });
      clearSendTimers();
      sendTimers.current.push(
        window.setTimeout(() => setSending({ index: itemIndex, phase: "shift" }), SEND_FAN_DELAY_MS),
        window.setTimeout(() => setSending({ index: itemIndex, phase: "tuck" }), SEND_TUCK_MS),
        window.setTimeout(() => {
          sendingRef.current = null;
          sendToBack(itemIndex);
          setSending(null);
        }, SEND_MS)
      );
    },
    [reduceMotion, sendToBack, clearSendTimers]
  );

  useEffect(() => () => clearSendTimers(), [clearSendTimers]);

  if (items.length === 0) return null;

  const topIndex = stack[stack.length - 1];
  const topItem = items[topIndex];
  const topLabel = topItem.role
    ? `${topItem.title} — ${topItem.role}`
    : topItem.title;

  // Slot belakang tempat kartu yang dikirim mendarat. Saat arsip masih punya
  // antrean (lebih dari jendela tampak), kartu penggantinya sudah diketahui:
  // kemiringan slot dipakai dari kartu itu supaya pergantian commit mulus.
  const landingDepth = Math.min(VISIBLE - 1, items.length - 1);
  const mountingItem =
    items.length > VISIBLE ? items[stack[stack.length - 1 - VISIBLE]] : null;
  const landingJitter = jitter(
    (mountingItem ?? items[sending?.index ?? topIndex]).src,
    randomRotation
  );

  return (
    <div className={cn("flex w-full max-w-[min(70vw,300px)] flex-col gap-3", className)}>
      <div
        role="group"
        aria-label={labels.region}
        className="stack-container relative aspect-square w-full select-none"
      >
        {items.map((item, i) => {
          const depth = stack.length - 1 - stack.indexOf(i);
          if (depth < 0 || depth >= VISIBLE) return null;
          const isTop = depth === 0;
          const isSending = sending?.index === i;
          // Sejak fase shift, kartu lain sudah menuju kedalaman barunya —
          // commit urutan tinggal menyamakan state, tanpa gerakan tambahan.
          const shiftNow = sending !== null && !isSending && sending.phase !== "carry";
          return (
            <StackLayer
              key={item.src}
              item={item}
              depth={depth}
              landingDepth={landingDepth}
              landingJitter={landingJitter}
              isTop={isTop}
              sending={isSending}
              phase={isSending ? (sending?.phase ?? null) : null}
              shiftNow={shiftNow}
              reduceMotion={reduceMotion}
              randomRotation={randomRotation}
              sensitivity={sensitivity}
              label={topLabel}
              hint={labels.hint}
              clickEnabled={sendToBackOnClick}
              onRequestSend={() => beginSend(i)}
            />
          );
        })}
      </div>
      <p className="flex items-baseline justify-between gap-3 px-1 text-sm">
        <span className="text-ink-2">{topItem.title}</span>
        <span className="text-xs text-ink-3">{labels.hint}</span>
      </p>
    </div>
  );
}
