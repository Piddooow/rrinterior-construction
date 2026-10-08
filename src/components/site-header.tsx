"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { locales, type Dictionary, type Locale } from "@/i18n";
import type { PublicProject, PublicService } from "@/lib/content";
import { buildNavData, type NavLeaf } from "@/lib/nav";
import { prefersReducedMotion } from "@/lib/motion";
import { SITE, waHref } from "@/lib/site";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { BrandLogo } from "@/components/brand-mark";
import { StaggeredMenu } from "@/components/ui/staggered-menu";

type MenuKey = "work" | "services";

/**
 * Bilah atas situs. Menu burger memakai **StaggeredMenu** (Tahap H12, port
 * referensi react-bits: lapisan pra-panel, item bernomor yang naik bergilir,
 * catatan studio, socials) dengan pemicu burger di header.
 *
 * Sejak R7, saat panel terbuka seluruh halaman + header berada di belakang
 * scrim ber-blur (panel di atas header), tombol tutup berada **di dalam
 * panel** bersama logo, dan di ponsel panel menutup penuh satu layar.
 *
 * Prinsip: papan ketik berfungsi penuh (Escape menutup dan mengembalikan
 * fokus ke tombol menu, Tab terjebak di dalam panel), panel tertutup `inert`
 * sehingga tidak bisa difokus, `prefers-reduced-motion` membuka/menutup
 * tanpa animasi, dan tidak pernah ada tautan ke halaman yang belum ada.
 */
export function SiteHeader({
  locale,
  dict,
  services,
  latestProject,
}: {
  locale: Locale;
  dict: Dictionary;
  services: PublicService[];
  latestProject: PublicProject | null;
}) {
  const nav = buildNavData({ locale, dict, services, latestProject });
  const waBase = waHref(dict.wa.base);
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  const isActiveHref = (href: string) => {
    const path = href.split("#")[0];
    if (!path || path === `/${locale}`) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isGroupActive = (key: MenuKey) =>
    key === "work"
      ? nav.work.leaves.some((leaf) => isActiveHref(leaf.href))
      : isActiveHref(`/${locale}/services`);

  // Tautan ber-anchor (#hunian, #process) menunjuk seksi di halaman yang
  // sama; hanya tautan halaman penuh yang boleh ditandai "sedang aktif",
  // supaya menu tidak menyorot empat baris sekaligus di /projects.
  const isLeafActive = (href: string) =>
    !href.includes("#") && isActiveHref(href);

  // Dropdown desktop: satu grup terbuka pada satu waktu, dan pindah grup
  // menutup grup sebelumnya dulu, baru membuka yang baru — tidak ada panel
  // yang menumpuk walau hover-nya cepat.
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pendingGroup = useRef<{
    key: string;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const cancelPendingGroup = useCallback(() => {
    if (pendingGroup.current) {
      clearTimeout(pendingGroup.current.timer);
      pendingGroup.current = null;
    }
  }, []);
  const requestOpenGroup = useCallback(
    (key: string) => {
      if (openGroup === key) return;
      cancelPendingGroup();
      if (openGroup === null) {
        setOpenGroup(key);
        return;
      }
      setOpenGroup(null);
      const timer = setTimeout(() => {
        setOpenGroup(key);
        pendingGroup.current = null;
      }, prefersReducedMotion() ? 0 : 130);
      pendingGroup.current = { key, timer };
    },
    [openGroup, cancelPendingGroup],
  );
  const requestCloseGroup = useCallback(
    (key: string) => {
      if (pendingGroup.current?.key === key) cancelPendingGroup();
      setOpenGroup((current) => (current === key ? null : current));
    },
    [cancelPendingGroup],
  );
  useEffect(() => () => cancelPendingGroup(), [cancelPendingGroup]);

  /** Tutup/buka panel; animasi masuk-keluar ditangani StaggeredMenu. */
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Kembalikan fokus ke burger hanya bila fokus sedang berada di dalam
    // panel (tombol tutup atau tautan). Penting: popstate (tombol kembali
    // peramban) juga memanggil closeMenu — memindahkan fokus di situ akan
    // membatalkan pemulihan posisi gulir Next, jadi jangan pernah fokus
    // tanpa alasan.
    const active = document.activeElement as HTMLElement | null;
    if (active?.closest("#site-menu")) {
      // preventScroll: fokus ke tombol di header sticky tidak boleh
      // menyeret posisi gulir perjalanan pengguna.
      requestAnimationFrame(() => burgerRef.current?.focus({ preventScroll: true }));
    }
  }, []);

  const openMenu = useCallback(() => {
    // Dropdown desktop (satu grup terbuka) tidak boleh tertinggal terbuka
    // di belakang panel.
    setOpenGroup(null);
    setMenuOpen(true);
  }, []);

  // Tombol kembali/maju peramban menutup panel yang terbuka. Navigasi lewat
  // klik ditangani di tautan masing-masing (bukan setState di dalam effect).
  useEffect(() => {
    window.addEventListener("popstate", closeMenu);
    return () => window.removeEventListener("popstate", closeMenu);
  }, [closeMenu]);

  // Panel terbuka: kunci gulir latar TANPA menyentuh halaman — cukup
  // `overflow: hidden` pada body (posisi gulir, tinggi dokumen, dan seluruh
  // ScrollTrigger tidak pernah berubah). Khusus body saja, karena html+body
  // bersama-sama mematikan sticky header sehingga navbar lenyap saat halaman
  // tergulir. Jebak fokus (Tab berputar di dalam panel), Escape menutup dan
  // mengembalikan fokus ke burger. Header tetap di belakang scrim blur.
  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    // Kompensasi lebar scrollbar supaya tidak ada geseran layout ketika
    // scrollbar vertikal hilang karena overflow hidden.
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        burgerRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab") return;
      const panel = document.getElementById("site-menu");
      if (!panel) return;
      const focusables = [
        ...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ].filter(
        (el) => !el.closest("[inert]") && el.getClientRects().length > 0
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first || !focusables.includes(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !focusables.includes(active)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [menuOpen, closeMenu]);

  // Item menu datar ala referensi StaggeredMenu (enam item; sub-halaman
  // tetap terjangkau dari halaman landing-nya).
  const menuItems = [
    { label: nav.work.label, link: `/${locale}/projects` },
    { label: nav.services.label, link: `/${locale}/services` },
    { label: nav.about.label, link: nav.about.href },
    { label: nav.contact.label, link: nav.contact.href },
    { label: nav.faq.label, link: nav.faq.href },
    { label: nav.help.label, link: nav.help.href },
  ];
  const socialItems = [
    { label: "WhatsApp", link: waBase },
    { label: SITE.instagramHandle, link: SITE.instagram },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-line bg-canvas text-ink"
    >
      <div className="shell relative z-50 flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href={`/${locale}`}
            onClick={closeMenu}
            className="focus-ring flex items-center py-1"
          >
            <BrandLogo eager className="h-11 w-auto" />
          </Link>

          {/* Navbar inline desktop (dikembalikan): grup dropdown Karya &
              Layanan + tautan langsung. Burger tetap untuk < lg. Jarak dari
              logo ditambah sedikit (R15e) supaya tidak terasa menempel. */}
          <nav aria-label={dict.menu.label} className="hidden lg:ml-3 lg:block">
            <ul className="flex items-center gap-0.5">
              <DesktopMenuGroup
                label={nav.work.label}
                leaves={nav.work.leaves}
                active={isGroupActive("work")}
                isLeafActive={isLeafActive}
                open={openGroup === "work"}
                onOpen={() => requestOpenGroup("work")}
                onClose={() => requestCloseGroup("work")}
              />
              <DesktopMenuGroup
                label={nav.services.label}
                leaves={[...nav.services.leaves, nav.services.process]}
                active={isGroupActive("services")}
                isLeafActive={isLeafActive}
                open={openGroup === "services"}
                onOpen={() => requestOpenGroup("services")}
                onClose={() => requestCloseGroup("services")}
              />
              <DesktopNavLink
                href={nav.about.href}
                label={nav.about.label}
                active={isActiveHref(nav.about.href)}
              />
              <DesktopNavLink
                href={nav.contact.href}
                label={nav.contact.label}
                active={isActiveHref(nav.contact.href)}
              />
              <DesktopNavLink
                href={nav.faq.href}
                label={nav.faq.label}
                active={isActiveHref(nav.faq.href)}
              />
              <DesktopNavLink
                href={nav.help.href}
                label={nav.help.label}
                active={isActiveHref(nav.help.href)}
              />
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-4 lg:flex">
            <LanguageLinks
              locale={locale}
              label={dict.language.legend}
              onNavigate={closeMenu}
            />
            <WhatsAppButton
              message={dict.wa.base}
              label={dict.hero.ctaPrimary}
              className="px-4 text-[13px]"
            />
          </div>

          <button
            ref={burgerRef}
            type="button"
            className={`group focus-ring relative flex size-10 cursor-pointer items-center justify-center rounded-sm border border-line-strong transition-[background-color,border-color,color,transform] duration-200 ease-out hover:bg-hover-surface hover:border-ink/40 active:scale-[0.92] motion-reduce:transition-none ${
              menuOpen ? "text-primary" : "text-ink"
            }`}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? dict.menu.close : dict.menu.open}
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
          >
            {/* Area sentuh 44px (visual 40px): elemen transparan yang
                memperluas target ketuk tanpa mengubah tampilan. Catatan:
                containing block elemen absolut adalah padding box (38px
                karena border 1px), sehingga -3px menghasilkan 38+6 = 44px
                alias 2px di luar border box. */}
            <span aria-hidden="true" className="absolute -inset-[3px] rounded-sm" />
            <span aria-hidden="true" className="relative block h-3.5 w-[18px]">
              <span
                className={`absolute left-0 top-0 h-[2px] w-[18px] rounded-full bg-current transition-[translate,rotate] duration-300 ease-out ${
                  menuOpen ? "translate-y-[6px] rotate-45" : "group-hover:-translate-y-px"
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[2px] w-[18px] rounded-full bg-current transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[12px] h-[2px] w-[18px] rounded-full bg-current transition-[translate,rotate] duration-300 ease-out ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : "group-hover:translate-y-px"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <StaggeredMenu
        open={menuOpen}
        position="right"
        items={menuItems}
        socialItems={socialItems}
        onClose={closeMenu}
        socialsLabel={dict.menu.socials}
        eyebrow={dict.menu.eyebrow}
        tagline={dict.menu.tagline}
        closeLabel={dict.menu.close}
        brand={<BrandLogo className="h-11 w-auto" eager tone="light" />}
        note={{
          lines: [dict.menuNote.area, dict.menuNote.scope, dict.menuNote.invite],
        }}
      >
        <LanguageLinks
          locale={locale}
          label={dict.language.legend}
          onNavigate={closeMenu}
        />
        <WhatsAppButton
          message={dict.wa.base}
          label={dict.hero.ctaPrimary}
          onClick={closeMenu}
        />
      </StaggeredMenu>
    </header>
  );
}

function LanguageLinks({
  locale,
  label,
  onNavigate,
}: {
  locale: Locale;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      {locales.map((item) =>
        item === locale ? (
          <span
            key={item}
            aria-current="true"
            className="inline-flex min-h-11 items-center px-2 text-[11px] font-semibold uppercase text-ink lg:min-h-0 lg:px-1"
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={`/${item}`}
            onClick={onNavigate}
            className="focus-ring inline-flex min-h-11 items-center px-2 text-[11px] uppercase text-ink-3 transition-colors hover:text-ink lg:min-h-0 lg:px-1"
          >
            {item}
          </Link>
        )
      )}
    </div>
  );
}

/**
 * Grup dropdown navbar desktop: terbuka saat hover ATAU saat tombol
 * diklik/di-Enter (aria-expanded akurat), tertutup saat pointer keluar,
 * fokus keluar, Escape, atau setelah memilih tautan. Saat tertutup panel
 * `invisible` sehingga tautannya tidak bisa difokus — jadi urutan Tab
 * tidak pernah tertelan panel tersembunyi.
 */
function DesktopMenuGroup({
  label,
  leaves,
  active,
  isLeafActive,
  open,
  onOpen,
  onClose,
}: {
  label: string;
  leaves: NavLeaf[];
  active: boolean;
  isLeafActive?: (href: string) => boolean;
  /** Terkendali dari induk: satu grup terbuka pada satu waktu. */
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Ditutup dari luar (grup lain dibuka): batalkan rencana tutup lokal.
  useEffect(() => {
    if (!open) clearTimeout(closeTimer.current);
  }, [open]);

  const openNow = () => {
    clearTimeout(closeTimer.current);
    onOpen();
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(onClose, 120);
  };
  const closeNow = () => {
    clearTimeout(closeTimer.current);
    onClose();
  };

  return (
    <li
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          closeNow();
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        closeNow();
        buttonRef.current?.focus();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={active ? "true" : undefined}
        onClick={() => (open ? closeNow() : openNow())}
        className="focus-ring flex min-h-11 items-center gap-1 rounded-sm px-3 text-sm text-ink-2 transition-colors hover:text-ink lg:py-2"
      >
        {label}
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`absolute left-0 top-full z-50 min-w-64 pt-2 transition-[opacity,translate,visibility] duration-200 ease-out ${
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-1 opacity-0"
        }`}
      >
        <div className="rounded-md border border-line bg-canvas p-1.5 shadow-xl">
          {leaves.map((leaf) => (
            <Link
              key={leaf.key}
              href={leaf.href}
              onClick={closeNow}
              aria-current={isLeafActive?.(leaf.href) ? "page" : undefined}
              className="focus-ring flex min-h-11 flex-col justify-center gap-0.5 rounded-sm px-3 py-2 transition-colors hover:bg-hover-surface"
            >
              <span className="text-sm text-ink">{leaf.label}</span>
              {leaf.description ? (
                <span className="text-xs leading-snug text-ink-2">
                  {leaf.description}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
}

function DesktopNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`focus-ring flex min-h-11 items-center rounded-sm px-3 text-sm transition-colors lg:min-h-0 lg:py-2 ${
          active ? "font-medium text-ink" : "text-ink-2 hover:text-ink"
        }`}
      >
        {label}
      </Link>
    </li>
  );
}
