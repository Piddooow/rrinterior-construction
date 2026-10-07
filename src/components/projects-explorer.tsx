"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ProjectCard } from "@/components/project-card";
import type { ProjectCardView } from "@/lib/view-models";
import {
  ProjectsFilterBar,
  type FilterGroupView,
} from "@/components/projects-filter-bar";
import { FilterChips } from "@/components/filter-chips";
import { WhatsAppButton } from "@/components/whatsapp-button";

export type ExplorerItem = {
  slug: string;
  card: ProjectCardView;
  year: number;
  locationSlug: string;
  typeSlug: string;
  status: "selesai" | "berjalan" | null;
  categoryId: string;
};

export type ExplorerGroupMeta = {
  id: string;
  number: string;
  label: string;
  description: string;
};

export type ExplorerOptionSets = {
  locations: { value: string; label: string }[];
  types: { value: string; label: string }[];
  statuses: { value: string; label: string }[];
};

export type ExplorerLabels = {
  filterLocation: string;
  filterType: string;
  filterStatus: string;
  all: string;
  filtersLabel: string;
  activeFilters: string;
  removeFilter: string;
  clearAll: string;
  clear: string;
  count: string;
  countOne: string;
  emptyTitle: string;
  emptyHint: string;
  emptyAllTitle: string;
  emptyAllHint: string;
  categoryEmpty: string;
  cardCta: string;
  roleRender: string;
  roleSite: string;
  photoFallback: string;
  ctaPrimary: string;
  instagram: string;
  waMessage: string;
};

const FILTER_KEYS = ["location", "type", "status"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];
type Filters = Partial<Record<FilterKey, string>>;

/**
 * Direktori karya interaktif (R15b). Saringan dibaca dari URL lewat
 * `useSearchParams`, jadi URL tetap satu-satunya sumber kebenaran dan
 * render server tetap menyaring untuk tautan langsung maupun pengguna
 * tanpa JavaScript. Saat pengunjung mengganti saringan, item dirender
 * ulang di tempat dengan animasi layout (masonry re-flow) — tanpa tirai
 * transisi antar-halaman karena item saringan adalah tautan Next bertanda
 * `data-no-transition` dengan `scroll={false}`.
 */
export function ProjectsExplorer({
  locale,
  items,
  groupsMeta,
  optionSets,
  labels,
  instagramHref,
}: {
  locale: string;
  items: ExplorerItem[];
  groupsMeta: ExplorerGroupMeta[];
  optionSets: ExplorerOptionSets;
  labels: ExplorerLabels;
  instagramHref: string;
}) {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const filters: Filters = {
    location: searchParams.get("location") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  };
  const hasActiveFilters = FILTER_KEYS.some((key) => Boolean(filters[key]));

  const href = (overrides: Filters) => {
    const next: Filters = { ...filters, ...overrides };
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = next[key];
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return `/${locale}/projects${qs ? `?${qs}` : ""}`;
  };

  // Urut terbaru → lama; nilai seri mengikuti urutan data (sort_order).
  const sorted = useMemo(
    () => [...items].sort((a, b) => b.year - a.year),
    [items]
  );

  const filtered = sorted.filter(
    (item) =>
      (!filters.location || item.locationSlug === filters.location) &&
      (!filters.type || item.typeSlug === filters.type) &&
      (!filters.status || item.status === filters.status)
  );

  const groups = groupsMeta.map((meta) => ({
    ...meta,
    items: filtered.filter((item) => item.categoryId === meta.id),
  }));

  const filterGroups: FilterGroupView[] = [
    {
      id: "location",
      label: labels.filterLocation,
      allLabel: labels.all,
      allHref: href({ location: undefined }),
      activeValue: filters.location,
      activeLabel: optionSets.locations.find(
        (option) => option.value === filters.location
      )?.label,
      options: optionSets.locations.map((option) => ({
        value: option.value,
        label: option.label,
        href: href({
          location: filters.location === option.value ? undefined : option.value,
        }),
      })),
    },
    {
      id: "type",
      label: labels.filterType,
      allLabel: labels.all,
      allHref: href({ type: undefined }),
      activeValue: filters.type,
      activeLabel: optionSets.types.find(
        (option) => option.value === filters.type
      )?.label,
      options: optionSets.types.map((option) => ({
        value: option.value,
        label: option.label,
        href: href({ type: filters.type === option.value ? undefined : option.value }),
      })),
    },
    {
      id: "status",
      label: labels.filterStatus,
      allLabel: labels.all,
      allHref: href({ status: undefined }),
      activeValue: filters.status,
      activeLabel: optionSets.statuses.find(
        (option) => option.value === filters.status
      )?.label,
      options: optionSets.statuses.map((option) => ({
        value: option.value,
        label: option.label,
        href: href({
          status: filters.status === option.value ? undefined : option.value,
        }),
      })),
    },
  ];

  const activeChips = FILTER_KEYS.filter((key) => Boolean(filters[key])).map(
    (key) => ({
      key,
      label:
        (key === "location"
          ? optionSets.locations.find((o) => o.value === filters.location)?.label
          : key === "type"
            ? optionSets.types.find((o) => o.value === filters.type)?.label
            : optionSets.statuses.find((o) => o.value === filters.status)
              ?.label) ?? filters[key]!,
      href: href({ [key]: undefined }),
    })
  );

  const countText = (filtered.length === 1 ? labels.countOne : labels.count).replace(
    "{count}",
    String(filtered.length)
  );

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.23, 1, 0.32, 1] as const };

  return (
    <>
      <ProjectsFilterBar
        groups={filterGroups}
        chips={activeChips}
        clearHref={href({})}
        hasActiveFilters={hasActiveFilters}
        labels={{
          filtersLabel: labels.filtersLabel,
          activeFilters: labels.activeFilters,
          removeFilter: labels.removeFilter,
          clearAll: labels.clearAll,
        }}
        soft
      />

      <p className="mt-6 text-sm text-ink-3">{countText}</p>

      {filtered.length === 0 ? (
        items.length === 0 ? (
          <div className="mt-10 rounded-md border border-line bg-subtle px-6 py-10 text-center">
            <p className="font-display text-2xl leading-snug">
              {labels.emptyAllTitle}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
              {labels.emptyAllHint}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <WhatsAppButton
                message={labels.waMessage}
                label={labels.ctaPrimary}
              />
              <a
                className="btn btn-secondary"
                href={instagramHref}
                target="_blank"
                rel="noopener"
              >
                {labels.instagram}
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-md border border-line bg-subtle px-6 py-10 text-center">
            <p className="font-display text-2xl leading-snug">
              {labels.emptyTitle}
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
              {labels.emptyHint}
            </p>
            <FilterChips
              className="mt-5 justify-center"
              label={labels.activeFilters}
              chips={activeChips}
              removeLabel={labels.removeFilter}
              soft
            />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a className="btn btn-secondary" href={href({})}>
                {labels.clear}
              </a>
              <WhatsAppButton
                message={labels.waMessage}
                label={labels.ctaPrimary}
              />
            </div>
          </div>
        )
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className={
              groupIndex === 0 ? "mt-10" : "mt-14 border-t border-line pt-10"
            }
          >
            <div
              data-reveal
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
            >
              <span className="text-xs uppercase tracking-wider text-ink-3">
                {group.number}
              </span>
              <h2
                id={`${group.id}-title`}
                className="font-display text-balance text-2xl leading-tight sm:text-3xl"
              >
                {group.label}
              </h2>
            </div>
            <p
              data-reveal
              className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2"
            >
              {group.description}
            </p>
            {group.items.length > 0 ? (
              <motion.ul
                layout
                transition={transition}
                className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {group.items.map((item, index) => (
                    <motion.li
                      key={item.slug}
                      layout
                      className="masonry-item"
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      whileHover={reduceMotion ? undefined : { scale: 0.95 }}
                      transition={transition}
                    >
                      <ProjectCard
                        priority={groupIndex === 0 && index < 3}
                        card={item.card}
                        badge={{
                          render: labels.roleRender,
                          site: labels.roleSite,
                        }}
                        cta={labels.cardCta}
                        photoFallback={labels.photoFallback}
                        href={`/${locale}/projects/${item.slug}`}
                        reveal={false}
                        fade
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <p className="mt-6 text-sm text-ink-3">
                {labels.categoryEmpty}
              </p>
            )}
          </section>
        ))
      )}
    </>
  );
}
