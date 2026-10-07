"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import gsap from "gsap";
import { initGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  InstagramGlyph,
  WhatsAppGlyph,
} from "@/components/ui/channel-glyphs";

/**
 * StaggeredMenu — port setia dari referensi (DavidHDev/react-bits), disesuaikan
 * ke palet PRD lewat token: panel memakai `--primary`, teks `--primary-ink`,
 * aksen `--sm-accent`. Struktur, timeline, stagger, numbering, dan socials
 * mengikuti referensi; yang berbeda hanya pemicunya (burger header situs
 * ini), slot `children` (pemilih bahasa + CTA), blok catatan studio, dan
 * scrim ber-blur yang menutup area luar panel (klik = tutup).
 *
 * A11y tambahan di luar referensi: panel `inert` saat tertutup, aksen fokus
 * memakai `--focus-ring`, dan reduced-motion membuka/menutup tanpa animasi.
 */

import { ArrowIcon } from "@/components/ui/arrow-icon";

export type StaggeredMenuItem = {
  label: string;
  ariaLabel?: string;
  link: string;
};

export type StaggeredMenuSocial = {
  label: string;
  link: string;
};

export function StaggeredMenu({
  open,
  position = "right",
  items,
  socialItems,
  displaySocials = true,
  displayItemNumbering = true,
  colors = ["var(--primary)", "var(--primary-hover)"],
  className,
  onClose,
  socialsLabel,
  eyebrow,
  tagline,
  brand,
  closeLabel,
  note,
  children,
}: {
  open: boolean;
  position?: "left" | "right";
  items: StaggeredMenuItem[];
  socialItems: StaggeredMenuSocial[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  /** Warna lapisan pra-panel (dua warna, seperti referensi). */
  colors?: string[];
  className?: string;
  onClose?: () => void;
  socialsLabel?: string;
  /** Label kecil di atas daftar item (mis. "Menu"). */
  eyebrow?: string;
  /** Slogan singkat di bawah eyebrow (R7). */
  tagline?: string;
  /** Logo di baris teratas panel, di atas teks Menu (R7). */
  brand?: ReactNode;
  /** Label aksesibilitas tombol tutup di dalam panel. */
  closeLabel?: string;
  /** Catatan editorial penutup: motif (opsional) + baris kecil. */
  note?: { motif?: string; lines: string[] };
  /** Slot tambahan di panel (pemilih bahasa + CTA). */
  children?: ReactNode;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Animation | null>(null);
  const wasOpenRef = useRef(false);

  const offscreen = position === "left" ? -100 : 100;

  // Pasang kondisi awal (offscreen) setelah render pertama — tanpa animasi.
  useLayoutEffect(() => {
    initGsap();
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    if (!panel) return;
    const layers = preContainer
      ? Array.from(preContainer.querySelectorAll<HTMLElement>(".sm-prelayer"))
      : [];
    // `x: 0` wajib: transform CSS awal (translateX(100%)) terbaca GSAP
    // sebagai x=390 dan tidak pernah dibersihkan oleh tween xPercent saja.
    gsap.set([panel, ...layers], { x: 0, xPercent: offscreen, opacity: 1 });
    if (preContainer) gsap.set(preContainer, { xPercent: 0, opacity: 1 });
  }, [offscreen]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return null;
    const layers = preLayersRef.current
      ? Array.from(preLayersRef.current.querySelectorAll<HTMLElement>(".sm-prelayer"))
      : [];

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    const itemEls = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
    const numberEls = Array.from(
      panel.querySelectorAll<HTMLElement>(".sm-panel-list[data-numbering] .sm-panel-item"),
    );
    const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
    const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>(".sm-socials-link"));
    // Blok lembut: baris logo+tutup, eyebrow+slogan, utilitas, dan catatan.
    const softEls = Array.from(panel.querySelectorAll<HTMLElement>("[data-sm-soft]"));

    if (prefersReducedMotion()) {
      gsap.set([panel, ...layers], { x: 0, xPercent: 0 });
      gsap.set(itemEls, { yPercent: 0, rotate: 0 });
      for (const el of numberEls) el.style.setProperty("--sm-num-opacity", "1");
      if (socialTitle) gsap.set(socialTitle, { opacity: 1 });
      if (socialLinks.length) gsap.set(socialLinks, { y: 0, opacity: 1 });
      if (softEls.length) gsap.set(softEls, { opacity: 1, y: 0 });
      return null;
    }

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    for (const el of numberEls) el.style.setProperty("--sm-num-opacity", "0");
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
    if (softEls.length) gsap.set(softEls, { opacity: 0, y: 18 });

    const tl = gsap.timeline({ paused: true });
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07,
      );
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.6;
    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime,
    );

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.85,
          ease: "power4.out",
          stagger: { each: 0.08, from: "start" },
        },
        itemsStart,
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.6, ease: "power2.out", "--sm-num-opacity": 1, stagger: { each: 0.08 } },
          itemsStart + 0.1,
        );
      }
      if (softEls.length) {
        tl.to(
          softEls,
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.07 },
          itemsStart + 0.22,
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, socialsStart);
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: { each: 0.08 } },
          socialsStart + 0.04,
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [offscreen]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    const panel = panelRef.current;
    if (!panel) return;
    const layers = preLayersRef.current
      ? Array.from(preLayersRef.current.querySelectorAll<HTMLElement>(".sm-prelayer"))
      : [];
    closeTweenRef.current?.kill();

    const resetInner = () => {
      const itemEls = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
      if (itemEls.length && !prefersReducedMotion()) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
      for (const el of panel.querySelectorAll<HTMLElement>(".sm-panel-list[data-numbering] .sm-panel-item")) {
        el.style.setProperty("--sm-num-opacity", "0");
      }
      const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
      const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>(".sm-socials-link"));
      const softEls = Array.from(panel.querySelectorAll<HTMLElement>("[data-sm-soft]"));
      if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
      if (socialLinks.length && !prefersReducedMotion()) gsap.set(socialLinks, { y: 25, opacity: 0 });
      if (softEls.length && !prefersReducedMotion()) gsap.set(softEls, { opacity: 0, y: 18 });
    };

    if (prefersReducedMotion()) {
      gsap.set([panel, ...layers], { xPercent: offscreen });
      resetInner();
      return;
    }

    // Penutup simetris dengan pembukaan: isi panel keluar lebih dulu
    // (terbalik dari urutan masuk), lalu panel menyusul dan lapisan
    // pra-panel menutup di belakangnya — tidak ada elemen yang "menjungkir".
    const itemEls = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
    const softEls = Array.from(panel.querySelectorAll<HTMLElement>("[data-sm-soft]"));
    const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
    const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>(".sm-socials-link"));

    const tl = gsap.timeline({ onComplete: resetInner });
    if (softEls.length) {
      tl.to(softEls, { opacity: 0, y: 10, duration: 0.2, ease: "power2.in", stagger: 0.025 }, 0);
    }
    if (itemEls.length) {
      tl.to(
        itemEls,
        {
          yPercent: 120,
          rotate: 8,
          duration: 0.3,
          ease: "power3.in",
          stagger: { each: 0.035, from: "end" },
        },
        0,
      );
    }
    if (socialLinks.length) {
      tl.to(socialLinks, { y: 14, opacity: 0, duration: 0.2, ease: "power2.in", stagger: 0.03 }, 0.04);
    }
    if (socialTitle) tl.to(socialTitle, { opacity: 0, duration: 0.18 }, 0.04);

    tl.to(panel, { xPercent: offscreen, duration: 0.42, ease: "power3.inOut" }, 0.1);
    [...layers].reverse().forEach((el, i) => {
      tl.to(el, { xPercent: offscreen, duration: 0.34, ease: "power3.in" }, 0.16 + i * 0.05);
    });

    closeTweenRef.current = tl;
  }, [offscreen]);

  // Buka/tutup mengikuti prop `open` dari header (pemicunya burger).
  useEffect(() => {
    if (open) {
      const tl = buildOpenTimeline();
      wasOpenRef.current = true;
      if (tl) tl.play(0);
    } else if (wasOpenRef.current) {
      playClose();
      wasOpenRef.current = false;
    }
  }, [open, buildOpenTimeline, playClose]);

  useEffect(
    () => () => {
      openTlRef.current?.kill();
      closeTweenRef.current?.kill();
    },
    [],
  );

  const layers = (() => {
    const raw = colors && colors.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];
    const arr = [...raw];
    if (arr.length >= 3) {
      const mid = Math.floor(arr.length / 2);
      arr.splice(mid, 1);
    }
    return arr;
  })();

  return (
    <div
      className={cn("staggered-menu-wrapper", className)}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {layers.map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      <div className="sm-scrim" aria-hidden="true" onPointerDown={onClose} />

      <aside
        id="site-menu"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
        inert={!open}
        aria-label="Menu"
      >
        <div className="sm-panel-inner">
          <div className="sm-panel-top" data-sm-soft>
            {brand ? <div className="sm-panel-brand">{brand}</div> : null}
            <button
              type="button"
              className="sm-close"
              aria-label={closeLabel ?? "Close"}
              onClick={(event) => {
                // Fokuskan tombol dulu supaya pengembalian fokus ke burger
                // terdeteksi, apa pun perangkat kliknya (tanpa efek gulir).
                event.currentTarget.focus({ preventScroll: true });
                onClose?.();
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="size-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {eyebrow || tagline ? (
            <div className="sm-panel-heading" data-sm-soft>
              {eyebrow ? <p className="sm-panel-eyebrow">{eyebrow}</p> : null}
              {tagline ? <p className="sm-panel-tagline">{tagline}</p> : null}
            </div>
          ) : null}
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items.map((item, idx) => (
              <li className="sm-panel-itemWrap" key={item.label + idx}>
                <Link
                  href={item.link}
                  className="sm-panel-item"
                  aria-label={item.ariaLabel}
                  data-index={idx + 1}
                  onClick={onClose}
                >
                  <span className="sm-panel-itemLabel">{item.label}</span>
                  <span className="sm-panel-arrow" aria-hidden="true">
                    <ArrowIcon className="size-6" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {note ? (
            <div data-sm-note data-sm-soft className="sm-panel-note">
              {note.motif ? <p className="sm-panel-noteMotif">{note.motif}</p> : null}
              {note.lines.map((line) => (
                <p className="sm-panel-noteLine" key={line}>
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          {children ? (
            <div data-sm-extra data-sm-soft className="sm-panel-extra">
              {children}
            </div>
          ) : null}

          {displaySocials && socialItems.length > 0 ? (
            <div className="sm-socials" aria-label={socialsLabel ?? "Socials"}>
              {socialsLabel ? <h2 className="sm-socials-title">{socialsLabel}</h2> : null}
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener"
                      className="sm-socials-link"
                      onClick={onClose}
                    >
                      {/* Logo kanal (R16g): membantu pengunjung mengenali
                          WhatsApp/Instagram sekilas, terutama di ponsel. */}
                      {s.link.includes("wa.me") ? (
                        <WhatsAppGlyph className="size-4 shrink-0" />
                      ) : s.link.includes("instagram.com") ? (
                        <InstagramGlyph className="size-4 shrink-0" />
                      ) : null}
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
