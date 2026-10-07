import type { Metadata } from "next";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import {
  getPublishedProjects,
  getPublishedProjectFilterOptions,
  getPublicSettings,
} from "@/lib/content";
import { pickLocalized, toProjectCard } from "@/lib/view-models";
import { applySiteSettings } from "@/lib/settings";
import { slugify } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageJsonLd } from "@/lib/seo";
import ParallaxStripSlider from "@/components/ui/parallax-strip-slider";
import {
  ProjectsExplorer,
  type ExplorerItem,
  type ExplorerLabels,
} from "@/components/projects-explorer";
import {
  WORK_CATEGORY_IDS,
  workCategoryFor,
  workCategoryLabels,
} from "@/lib/work-categories";

// Direktori menyaring di klien (R15b); halaman tetap dinamis supaya
// tautan langsung dan pengguna tanpa JavaScript mendapat hasil tersaring
// dari render server.
export const dynamic = "force-dynamic";

/**
 * Sampul khusus slider hero (kurasi visual Tahap E): dipilih agar tiap slide
 * paling mewakili judulnya pada tampilan lebar — sampul kartu/detail tetap
 * memakai cover proyek dari basis data, hanya presentasi slider yang memakai
 * pilihan ini.
 */
const SLIDER_COVERS: Record<string, string> = {
  "living-room-nature-classic": "/work/living-room-nature-classic/02.webp",
  "bedroom-toilet-warm-minimalist":
    "/work/bedroom-toilet-warm-minimalist/05.jpg",
  "apartment-family-area": "/work/apartment-family-area/02.jpg",
  "kitchen-set-design": "/work/kitchen-set-design/02.webp",
  "modern-house-exterior": "/work/modern-house-exterior/02.jpg",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.directory.metaTitle,
    description: dict.directory.metaDescription,
    alternates: { languages: { en: "/en/projects", id: "/id/projects" } },
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = applySiteSettings(
    getDictionary(locale),
    await getPublicSettings(),
    locale
  );
  // Semua proyek terbit; explorer klien menyaring di tempat (R15b), jadi
  // halaman cukup memuat satu daftar penuh + opsi saringan.
  const projects = await getPublishedProjects();
  const filterOptions = await getPublishedProjectFilterOptions();

  // Hero: lima karya terbaru yang punya sampul, urut terbaru.
  const slides = [...projects]
    .filter((project) => project.cover)
    .sort((a, b) => (b.yearCompleted ?? 0) - (a.yearCompleted ?? 0))
    .slice(0, 5)
    .map((project) => ({
      src: SLIDER_COVERS[project.slug] ?? project.cover!.url,
      title: pickLocalized(project.title, locale, project.slug),
      chapter: pickLocalized(project.scopeOfWork, locale, "") || undefined,
      href: `/${locale}/projects/${project.slug}`,
    }));

  const categoryLabels = workCategoryLabels(dict);
  const groupsMeta = WORK_CATEGORY_IDS.map((id, index) => ({
    id,
    number: String(index + 1).padStart(2, "0"),
    label: categoryLabels[id].label,
    description: categoryLabels[id].description,
  }));

  // Item serializable untuk explorer: kartu siap render + kunci saringan
  // yang dihitung di server (logika sama dengan data layer).
  const items: ExplorerItem[] = projects.map((project) => ({
    slug: project.slug,
    card: toProjectCard(project, locale, dict),
    year: project.yearCompleted ?? 0,
    locationSlug: project.generalLocation
      ? slugify(project.generalLocation)
      : "",
    typeSlug: slugify(project.scopeOfWork.en ?? project.scopeOfWork.id ?? ""),
    status: project.projectStatus,
    categoryId: workCategoryFor(project.slug, project.scopeOfWork.en),
  }));

  const optionSets = {
    locations: filterOptions.locations.map((value) => ({
      value: slugify(value),
      label: value,
    })),
    types: filterOptions.types.map((option) => ({
      value: option.value,
      label: pickLocalized(option.label, locale, option.value),
    })),
    statuses: filterOptions.statuses.map((value) => ({
      value,
      label:
        value === "selesai"
          ? dict.work.statusSelesai
          : dict.work.statusBerjalan,
    })),
  };

  const labels: ExplorerLabels = {
    filterLocation: dict.directory.filterLocation,
    filterType: dict.directory.filterType,
    filterStatus: dict.directory.filterStatus,
    all: dict.directory.all,
    filtersLabel: dict.directory.filtersLabel,
    activeFilters: dict.directory.activeFilters,
    removeFilter: dict.directory.removeFilter,
    clearAll: dict.directory.clearAll,
    clear: dict.directory.clear,
    count: dict.directory.count,
    countOne: dict.directory.countOne,
    emptyTitle: dict.directory.emptyTitle,
    emptyHint: dict.directory.emptyHint,
    emptyAllTitle: dict.directory.emptyAllTitle,
    emptyAllHint: dict.directory.emptyAllHint,
    categoryEmpty: dict.directory.categoryEmpty,
    cardCta: dict.work.cardCta,
    roleRender: dict.work.roleRender,
    roleSite: dict.work.roleSite,
    photoFallback: dict.work.photoFallback,
    ctaPrimary: dict.hero.ctaPrimary,
    instagram: dict.about.instagram,
    waMessage: dict.wa.directory,
  };
  return (
    <>
      <section className="shell pt-14 pb-10 sm:pt-16">
        <Breadcrumbs
          label={dict.breadcrumb.label}
          items={[
            { label: dict.breadcrumb.home, href: `/${locale}` },
            { label: dict.directory.title },
          ]}
          className="mb-6"
        />
        <JsonLd
          data={[
            pageJsonLd({
              locale,
              path: "/projects",
              name: dict.directory.title,
              description: dict.directory.metaDescription,
              type: "CollectionPage",
            }),
            breadcrumbJsonLd([
              { name: dict.breadcrumb.home, path: `/${locale}` },
              { name: dict.directory.title, path: `/${locale}/projects` },
            ]),
          ]}
        />
        <h1
          data-reveal
          className="font-display text-balance text-4xl leading-tight sm:text-5xl"
        >
          {dict.directory.title}
        </h1>
        <p
          data-reveal
          className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2"
        >
          {dict.directory.intro}
        </p>
        {projects.length > 0 ? (
          <nav
            aria-label={dict.directory.categoryNav}
            data-reveal
            className="mt-6 flex flex-wrap gap-2"
          >
            {groupsMeta.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="focus-ring inline-flex min-h-11 items-center rounded-sm border border-line-strong px-3 text-sm text-ink-2 transition-colors hover:bg-hover-surface lg:min-h-0 lg:py-1"
              >
                {group.label}
              </a>
            ))}
          </nav>
        ) : null}
      </section>

      {/* Hero: etalase karya terbaru — selebar kolom konten, bersudut membulat.
          Sejak R15a seluruh bingkai memakai tema terang; teks dan panah di
          atas foto tetap krem (lapisan fungsional di atas gambar). */}
      {slides.length > 0 ? (
        <section
          aria-label={dict.directory.sliderRegion}
          className="text-ink"
        >
          <div className="shell">
            <div className="relative h-[56vh] max-h-[640px] min-h-[400px] w-full overflow-hidden rounded-md bg-[var(--background-subtle)]">
              <ParallaxStripSlider
                slides={slides}
                autoplay
                accentColor="#FFFCEF"
                backgroundColor="#F5EEDF"
                labels={{
                  region: dict.directory.sliderRegion,
                  prev: dict.directory.sliderPrev,
                  next: dict.directory.sliderNext,
                  view: dict.navMenu.viewProject,
                }}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="shell pt-10 pb-16 sm:pb-20">
        <ProjectsExplorer
          locale={locale}
          items={items}
          groupsMeta={groupsMeta}
          optionSets={optionSets}
          labels={labels}
          instagramHref={SITE.instagram}
        />
      </section>
    </>
  );
}
