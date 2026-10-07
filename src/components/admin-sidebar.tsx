"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/**
 * Sidebar panel (R24a, adaptasi komposisi referensi uiable ke bahasa situs):
 * logo + tautan situs di puncak, pencarian, dua kelompok menu berlabel,
 * kartu aksi "Tambah proyek", dan identitas pengguna di kaki sidebar.
 *
 * Di bawah 1024px sidebar menjadi laci geser dengan scrim; tutup lewat
 * tombol X, Escape, klik scrim, atau pindah halaman — pola yang sama
 * dengan menu situs publik. Fokus pemicu dikembalikan saat laci ditutup.
 */

export type AdminSidebarCounts = {
  projects: number;
  media: number;
  trash: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge: keyof AdminSidebarCounts | null;
};

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Menu utama",
    items: [
      { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, badge: null },
      { href: "/admin/projects", label: "Proyek", icon: FolderOpen, badge: "projects" },
      { href: "/admin/media", label: "Media", icon: ImageIcon, badge: "media" },
      { href: "/admin/services", label: "Layanan", icon: Sparkles, badge: null },
      { href: "/admin/pages", label: "Halaman", icon: FileText, badge: null },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { href: "/admin/panduan", label: "Panduan", icon: BookOpen, badge: null },
      { href: "/admin/settings", label: "Pengaturan", icon: Settings, badge: null },
      { href: "/admin/trash", label: "Tempat sampah", icon: Trash2, badge: "trash" },
    ],
  },
];

export function AdminSidebar({
  name,
  role,
  counts,
}: {
  name: string;
  role: string;
  counts?: AdminSidebarCounts;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "RR";

  // Layar melebar ke desktop: laci tidak relevan lagi.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Selama laci terbuka: Escape menutup (fokus kembali ke pemicu) dan
  // gulir latar dikunci seperti menu situs.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const value = q.trim();
    setOpen(false);
    router.push(
      value ? `/admin/projects?q=${encodeURIComponent(value)}` : "/admin/projects"
    );
  };

  return (
    <>
      {/* Bilah ponsel: pemicu laci + logo + tautan situs */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas px-4 lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-controls="admin-sidebar"
          aria-expanded={open}
          aria-label="Buka menu panel"
          className="focus-ring flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-line-strong text-primary transition-colors hover:border-primary hover:bg-hover-surface"
        >
          <PanelLeftOpen aria-hidden="true" className="size-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/color-rr-logo-coklat.svg"
          alt="RR Design & Build"
          width={304}
          height={315}
          className="h-10 w-10"
        />
        <Link
          href="/"
          aria-label="Lihat situs"
          className="focus-ring ml-auto flex size-11 items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-hover-surface hover:text-ink"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
        </Link>
      </header>

      {/* Scrim laci */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-[#130f0b]/30 backdrop-blur-[10px] transition-opacity duration-300 ease-out lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Sidebar: statis di desktop, laci di ponsel */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface transition-[translate,visibility] duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:translate-x-0 lg:visible lg:overflow-y-auto lg:transition-none",
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link
            href="/admin"
            aria-label="RR Design & Build — Panel"
            className="focus-ring flex items-center rounded-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/color-rr-logo-coklat.svg"
              alt="RR Design & Build"
              width={304}
              height={315}
              className="h-12 w-12"
            />
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              aria-label="Lihat situs"
              className="focus-ring hidden size-11 items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-hover-surface hover:text-ink lg:flex"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Tutup menu"
              className="focus-ring flex size-11 cursor-pointer items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-hover-surface hover:text-ink lg:hidden"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>

        <form role="search" onSubmit={search} className="px-5 pb-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
            />
            <input
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Cari proyek"
              aria-label="Cari proyek"
              className="focus-ring h-11 w-full rounded-sm border border-line-strong bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-ink-3"
            />
          </div>
        </form>

        <nav aria-label="Navigasi panel" className="flex-1 px-3 pb-2">
          {GROUPS.map((group) => (
            <div key={group.label} className="mt-3 first:mt-0">
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  const count =
                    item.badge && counts ? counts[item.badge] : null;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "focus-ring group flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                          active
                            ? "bg-primary font-medium text-primary-ink"
                            : "text-ink-2 hover:bg-hover-surface hover:text-ink"
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-[1.08]"
                        />
                        <span>{item.label}</span>
                        {count !== null && count > 0 ? (
                          <span
                            className={cn(
                              "ml-auto rounded-full px-2 py-0.5 text-[11px]",
                              active
                                ? "bg-primary-ink/20 text-primary-ink"
                                : "bg-subtle text-ink-3"
                            )}
                          >
                            {count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mx-5 mt-2 mb-4 rounded-md border border-line bg-subtle p-4">
          <p className="text-sm font-medium text-ink">Tambah konten baru</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            Judul dan satu foto sudah cukup untuk mulai.
          </p>
          <Link
            href="/admin/projects/new"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-3 w-full"
          >
            <Plus aria-hidden="true" className="size-4" />
            Tambah proyek
          </Link>
        </div>

        <footer className="mt-auto border-t border-line p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-ink"
            >
              {initials}
            </span>
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="focus-ring min-w-0 flex-1 rounded-sm px-1 py-1 transition-colors hover:bg-hover-surface"
            >
              <span className="block truncate text-sm font-medium text-ink">
                {name}
              </span>
              <span className="block text-[11px] text-ink-3">{role}</span>
            </Link>
            <form action={logoutAction} data-no-toast>
              <button
                type="submit"
                aria-label="Keluar"
                className="focus-ring flex size-11 cursor-pointer items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-hover-surface hover:text-ink"
              >
                <LogOut aria-hidden="true" className="size-4" />
              </button>
            </form>
          </div>
        </footer>
      </aside>
    </>
  );
}
