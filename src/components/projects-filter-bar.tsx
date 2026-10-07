"use client";

import { useState } from "react";
import {
  FilterDropdown,
  type FilterOption,
} from "@/components/ui/filter-dropdown";
import { FilterChips, type FilterChip } from "@/components/filter-chips";

export type FilterGroupView = {
  id: string;
  label: string;
  allLabel: string;
  allHref: string;
  activeValue?: string;
  activeLabel?: string;
  options: FilterOption[];
};

/**
 * Bar saringan direktori karya: dropdown per dimensi (lokasi/jenis/status)
 * + chip saringan aktif. Satu toolbar ringkas; URL tetap satu-satunya
 * sumber kebenaran. Sejak R15b `soft` dipakai direktori karya: item
 * dirender sebagai tautan Next tanpa tirai transisi dan tanpa lompatan
 * gulir, sehingga explorer klien menganimasikan susunan kartu di tempat.
 */
export function ProjectsFilterBar({
  groups,
  chips,
  clearHref,
  hasActiveFilters,
  labels,
  soft = false,
}: {
  groups: FilterGroupView[];
  chips: FilterChip[];
  clearHref: string;
  hasActiveFilters: boolean;
  labels: {
    filtersLabel: string;
    activeFilters: string;
    removeFilter: string;
    clearAll: string;
  };
  soft?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div
      data-reveal
      className="relative z-30 rounded-md border border-line bg-surface p-3 sm:p-5"
    >
      <div
        role="group"
        aria-label={labels.filtersLabel}
        className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      >
        {groups.map((group) => (
          <FilterDropdown
            key={group.id}
            label={group.label}
            allLabel={group.allLabel}
            allHref={group.allHref}
            options={group.options}
            activeValue={group.activeValue}
            activeLabel={group.activeLabel}
            open={openId === group.id}
            soft={soft}
            onOpenChange={(next) =>
              setOpenId((current) =>
                next ? group.id : current === group.id ? null : current
              )
            }
          />
        ))}
      </div>

      {hasActiveFilters ? (
        <FilterChips
          className="mt-3 sm:mt-4"
          label={labels.activeFilters}
          chips={chips}
          removeLabel={labels.removeFilter}
          clearHref={clearHref}
          clearLabel={labels.clearAll}
          soft={soft}
        />
      ) : null}

      {/* Tanpa JS dropdown tidak bisa dibuka; versi tautan polos ini hidup di
          dalam <noscript>, jadi pengguna JS tidak pernah melihat dua wajah
          bar saringan (R14c). */}
      <noscript dangerouslySetInnerHTML={{ __html: fallbackHtml(groups) }} />
    </div>
  );
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const linkClass =
  "focus-ring inline-flex min-h-11 items-center rounded-sm border border-line-strong px-3 text-sm text-ink-2 transition-colors hover:bg-hover-surface";

/** Markup tautan fallback untuk pengguna tanpa JavaScript. */
function fallbackHtml(groups: FilterGroupView[]) {
  const rows = groups
    .map((group) => {
      const links = [
        { href: group.allHref, label: group.allLabel },
        ...group.options.map((option) => ({
          href: option.href,
          label: option.label,
        })),
      ]
        .map(
          (link) =>
            `<a href="${escapeHtml(link.href)}" class="${linkClass}">${escapeHtml(link.label)}</a>`
        )
        .join("");
      return `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem">
        <span style="margin-right:0.25rem;width:100%;font-size:0.75rem;color:var(--foreground-muted)">${escapeHtml(group.label)}</span>
        ${links}
      </div>`;
    })
    .join("");
  return `<div style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem;border-top:1px solid var(--border-subtle);padding-top:1rem">${rows}</div>`;
}
