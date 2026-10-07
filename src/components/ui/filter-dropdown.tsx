"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string; href: string };

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// Muncul 180ms; menyingkir 100ms dengan skala yang lebih kecil, jadi
// penutupan tidak menahan mata.
const ENTER = { duration: 0.18, ease: EASE_OUT };
const EXIT = { duration: 0.1, ease: EASE_OUT };
// Huruf yang diketik dalam rentang ini melanjutkan pencarian, bukan mengulang.
const TYPEAHEAD_RESET = 500;

type FocusTarget = "first" | "last" | "menu";

/**
 * Dropdown saringan untuk halaman publik (bukan menu navigasi). Isinya
 * tautan nyata ke URL saringan — klik-tengah dan pembuka di tab baru tetap
 * bekerja, dan menutup menu tidak pernah mengorbankan navigasinya.
 * Papan ketik: panah, Home/End, Escape (fokus kembali ke pemicu),
 * Tab menutup, dan ketik-cepat melompat ke item.
 */
export function FilterDropdown({
  label,
  allLabel,
  allHref,
  options,
  activeValue,
  activeLabel,
  open,
  onOpenChange,
  align = "start",
  soft = false,
  className,
}: {
  label: string;
  allLabel: string;
  allHref: string;
  options: FilterOption[];
  activeValue?: string;
  activeLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: "start" | "end";
  /**
   * `true` = item dirender sebagai `next/link` tanpa transisi tirai dan
   * tanpa lompatan gulir (dipakai direktori karya, R15b) supaya pergantian
   * saringan dianimasikan di tempat oleh explorer klien.
   */
  soft?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;

  const rootRef = useRef<HTMLDivElement>(null);
  /** Posisi aman panel (R18): dihitung saat membuka agar tidak terpotong. */
  const [dropPos, setDropPos] = useState<{
    align: "start" | "end";
    up: boolean;
  }>({ align, up: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const focusTarget = useRef<FocusTarget>("menu");
  const lastPointerType = useRef("");
  // True selama tekan yang membuka menu masih ditahan, jadi melepasnya di
  // atas item memilih item itu, seperti menu asli.
  const pressFromTrigger = useRef(false);
  const typeahead = useRef({ query: "", timer: 0 });

  const items = [
    { key: "all", label: allLabel, href: allHref, active: !activeValue },
    ...options.map((option) => ({
      key: option.value,
      label: option.label,
      href: option.href,
      active: option.value === activeValue,
    })),
  ];

  const focusItem = (index: number) =>
    itemRefs.current[index]?.focus({ preventScroll: true });

  useEffect(() => {
    if (!open) return;
    const target = focusTarget.current;
    if (target === "first") focusItem(0);
    else if (target === "last") focusItem(items.length - 1);
    else menuRef.current?.focus({ preventScroll: true });
    // Hanya saat menu terbuka; daftar item statis selama ia terbuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const state = typeahead.current;
    return () => clearTimeout(state.timer);
  }, []);

  const openMenu = (target: FocusTarget) => {
    focusTarget.current = target;
    // Posisi aman (R18): ukur ruang viewport supaya panel tidak terpotong —
    // rata kanan bila mepet kanan, buka ke atas bila ruang bawah kurang.
    const r = rootRef.current?.getBoundingClientRect();
    if (r) {
      const PANEL_W = 224;
      const PANEL_H = 288;
      const M = 8;
      setDropPos({
        align: r.left + PANEL_W > window.innerWidth - M ? "end" : align,
        up: r.bottom + PANEL_H > window.innerHeight - M && r.top > PANEL_H + M,
      });
    }
    onOpenChange(true);
  };

  const close = (returnFocus: boolean) => {
    onOpenChange(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const move = (step: number) => {
    const at = itemRefs.current.indexOf(
      document.activeElement as HTMLAnchorElement,
    );
    const from = at === -1 ? (step > 0 ? -1 : 0) : at;
    const next = (from + step + items.length) % items.length;
    focusItem(next);
  };

  const search = (char: string) => {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.query += char.toLowerCase();
    state.timer = window.setTimeout(() => {
      state.query = "";
    }, TYPEAHEAD_RESET);

    // Menekan huruf yang sama berulang kali berputar di antara kecocokannya.
    const repeated = [...state.query].every((c) => c === state.query[0]);
    const query = repeated ? state.query[0] : state.query;
    const at = itemRefs.current.indexOf(
      document.activeElement as HTMLAnchorElement,
    );
    const start = repeated ? at + 1 : Math.max(at, 0);
    for (let n = 0; n < items.length; n += 1) {
      const index = (start + n) % items.length;
      if (items[index].label.toLowerCase().startsWith(query)) {
        focusItem(index);
        return;
      }
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        return;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        return;
      case "Home":
        e.preventDefault();
        focusItem(0);
        return;
      case "End":
        e.preventDefault();
        focusItem(items.length - 1);
        return;
      case " ":
        // Spasi tidak mengaktifkan tautan seperti Enter; samakan dengan
        // perilaku menu: ruang "menekan" item yang sedang difokus.
        e.preventDefault();
        (document.activeElement as HTMLElement | null)?.click();
        return;
      case "Escape":
        e.preventDefault();
        close(true);
        return;
      case "Tab":
        // Fokus lanjut ke kontrol berikutnya seperti biasa; menu minggir.
        close(false);
        return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      search(e.key);
    }
  };

  // Kedua keadaan memakai kunci yang sama, jadi Motion tidak pernah
  // menyimpan transform yang basi.
  const hidden = {
    opacity: 0,
    transform: reduceMotion ? "scale(1)" : "scale(0.95)",
  };
  const leaving = {
    opacity: 0,
    transform: reduceMotion ? "scale(1)" : "scale(0.97)",
    transition: EXIT,
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={activeLabel ? `${label}: ${activeLabel}` : label}
        onPointerDown={(e) => {
          lastPointerType.current = e.pointerType;
          // Sentuhan membuka lewat click, jadi menggulir yang dimulai di
          // pemicu tidak memunculkan menu.
          if (e.pointerType !== "mouse" || e.button !== 0 || e.ctrlKey) return;
          if (open) {
            close(false);
            return;
          }
          // Menjaga fokus tetap di luar pemicu; menu yang mengambilnya.
          e.preventDefault();
          pressFromTrigger.current = true;
          const release = () => {
            pressFromTrigger.current = false;
          };
          // Listener window berjalan setelah listener React, jadi pointerup
          // sebuah item masih melihat flag ini menyala.
          window.addEventListener("pointerup", release, { once: true });
          window.addEventListener("pointercancel", release, { once: true });
          openMenu("menu");
        }}
        onClick={() => {
          const pointer = lastPointerType.current;
          lastPointerType.current = "";
          // Tekan tetikus sudah ditangani di pointerdown. Ini mencakup
          // sentuhan dan teknologi bantu yang bisa mengklik tanpa keydown.
          if (pointer === "mouse") return;
          if (open) close(false);
          else openMenu(pointer ? "menu" : "first");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            openMenu("first");
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openMenu("last");
          }
        }}
        className={cn(
          "focus-ring inline-flex min-h-11 cursor-pointer touch-manipulation items-center gap-1.5 rounded-sm border border-line-strong px-3 text-sm transition-colors hover:bg-hover-surface",
          open && "bg-hover-surface",
          activeValue ? "font-medium text-ink" : "text-ink-2",
        )}
      >
        <span className="truncate">{activeLabel ?? label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-ink-3 transition-[rotate] duration-200 ease-out",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <Panel
            ref={menuRef}
            id={menuId}
            labelledBy={triggerId}
            align={dropPos.align}
            up={dropPos.up}
            initial={hidden}
            exit={leaving}
            onKeyDown={onMenuKeyDown}
            onPointerLeave={(e) => {
              if (e.pointerType === "touch") return;
              if (document.activeElement === menuRef.current) return;
              // Menyandarkan fokus di menu supaya sorotan hilang, tapi
              // tombol panah tetap bekerja.
              menuRef.current?.focus({ preventScroll: true });
            }}
            onBlur={(e) => {
              // Mencakup klik di luar, Tab keluar, dan meninggalkan jendela.
              if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
                close(false);
              }
            }}
          >
            {items.map((item, index) => {
              const common = {
                onPointerMove: (e: React.PointerEvent<HTMLAnchorElement>) => {
                  if (e.pointerType === "touch") return;
                  if (document.activeElement === itemRefs.current[index]) return;
                  focusItem(index);
                },
                onPointerUp: () => {
                  if (pressFromTrigger.current) itemRefs.current[index]?.click();
                },
                onClick: () => close(false),
                // Tanpa transisi pada sorotan: ia mengikuti setiap hover,
                // jadi easing apa pun terasa seperti lag.
                className:
                  "flex min-h-10 cursor-default items-center gap-2 rounded-sm px-2.5 text-sm text-ink outline-hidden select-none focus:bg-hover-surface",
              };
              const content = (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.active ? (
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                </>
              );
              const setRef = (el: HTMLAnchorElement | null) => {
                itemRefs.current[index] = el;
              };
              return soft ? (
                <Link
                  key={item.key}
                  ref={setRef}
                  href={item.href}
                  scroll={false}
                  data-no-transition
                  role="menuitem"
                  tabIndex={-1}
                  aria-current={item.active ? "true" : undefined}
                  {...common}
                >
                  {content}
                </Link>
              ) : (
                <a
                  key={item.key}
                  ref={setRef}
                  href={item.href}
                  role="menuitem"
                  tabIndex={-1}
                  aria-current={item.active ? "true" : undefined}
                  {...common}
                >
                  {content}
                </a>
              );
            })}
          </Panel>
        )}
      </AnimatePresence>
    </div>
  );
}

function Panel({
  ref,
  id,
  labelledBy,
  align,
  up,
  initial,
  exit,
  onKeyDown,
  onPointerLeave,
  onBlur,
  children,
}: {
  ref: React.Ref<HTMLDivElement>;
  id: string;
  labelledBy: string;
  align: "start" | "end";
  up: boolean;
  initial: { opacity: number; transform: string };
  exit: { opacity: number; transform: string; transition: typeof EXIT };
  onKeyDown: (e: React.KeyboardEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onBlur: (e: React.FocusEvent) => void;
  children: React.ReactNode;
}) {
  // Menu yang sedang menutup berhenti menerima pointer seketika, jadi ia
  // tidak pernah menghalangi klik berikutnya selama memudar.
  const isPresent = useIsPresent();
  return (
    <motion.div
      ref={ref}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      tabIndex={-1}
      initial={initial}
      animate={{ opacity: 1, transform: "scale(1)" }}
      exit={exit}
      transition={ENTER}
      onKeyDown={onKeyDown}
      onPointerLeave={onPointerLeave}
      onBlur={onBlur}
      // Tumbuh dari sudut pemicunya, bukan dari tengahnya sendiri.
      style={{
        transformOrigin: `${up ? "bottom" : "top"} ${align === "end" ? "right" : "left"}`,
      }}
      className={cn(
        "absolute z-50 max-h-72 w-56 overflow-y-auto overscroll-contain rounded-md border border-line bg-surface p-1.5 shadow-xl outline-hidden",
        up ? "bottom-full mb-1.5" : "top-full mt-1.5",
        align === "end" ? "right-0" : "left-0",
        !isPresent && "pointer-events-none",
      )}
    >
      {children}
    </motion.div>
  );
}
