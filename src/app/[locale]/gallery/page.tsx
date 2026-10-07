import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/i18n";
import {
  getPublishedProjects,
  getPublicSettings,
  type PublicProject,
} from "@/lib/content";
import { applySiteSettings } from "@/lib/settings";
import { archivePosts, archiveStats } from "@/lib/archive-data";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { ArchivePostButton } from "@/components/archive-post-button";
import { pickLocalized } from "@/lib/view-models";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageJsonLd } from "@/lib/seo";
import { MediaImage } from "@/components/ui/media-image";
import { DirectionalLink } from "@/components/ui/directional-link";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.gallery.metaTitle,
    description: dict.gallery.metaDescription,
    alternates: { languages: { en: "/en/gallery", id: "/id/gallery" } },
  };
}

const instagramPost = (shortcode: string) =>
  `https://www.instagram.com/rrinterior.construction/p/${shortcode}/`;

function formatDate(locale: Locale, isoDate: string): string {
  // Tengah malam lokal: hasil format tidak bergeser hari di zona mana pun.
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function GalleryPage({
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

  // Peta unggahan → proyek terkurasi: lencana "Karya pilihan" + tautan detail.
  const projects = await getPublishedProjects();
  const curated = new Map<string, PublicProject>();
  for (const project of projects) {
    if (project.sourcePost) curated.set(project.sourcePost, project);
  }

  const years = [...new Set(archivePosts.map((post) => post.year))];

  return (
    <section className="shell pt-14 pb-16 sm:pt-16 sm:pb-20">
      <Breadcrumbs
        label={dict.breadcrumb.label}
        items={[
          { label: dict.breadcrumb.home, href: `/${locale}` },
          { label: dict.gallery.title },
        ]}
        className="mb-6"
      />
      <JsonLd
        data={[
          pageJsonLd({
            locale,
            path: "/gallery",
            name: dict.gallery.title,
            description: dict.gallery.metaDescription,
          }),
          breadcrumbJsonLd([
            { name: dict.breadcrumb.home, path: `/${locale}` },
            { name: dict.gallery.title, path: `/${locale}/gallery` },
          ]),
        ]}
      />
      <h1
        data-reveal
        className="font-display text-balance text-4xl leading-tight sm:text-5xl"
      >
        {dict.gallery.title}
      </h1>
      <p
        data-reveal
        className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2"
      >
        {dict.gallery.intro}
      </p>
      <p data-reveal className="mt-3 text-sm text-ink-3">
        {dict.gallery.count
          .replace("{count}", String(archivePosts.length))
          .replace("{video}", String(archiveStats.videoOnly))}
      </p>

      <nav
        aria-label={dict.gallery.yearNav}
        data-reveal
        className="mt-6 flex flex-wrap gap-2"
      >
        {years.map((year) => (
          <a
            key={year}
            href={`#tahun-${year}`}
            className="focus-ring inline-flex min-h-11 items-center rounded-sm border border-line-strong px-3 text-sm text-ink-2 transition-colors hover:bg-hover-surface lg:min-h-0 lg:py-1"
          >
            {year}
          </a>
        ))}
      </nav>

      <p className="mt-6 text-xs leading-relaxed text-ink-3">
        {dict.gallery.captionNote}
      </p>

      {years.map((year) => (
        <section key={year} id={`tahun-${year}`} className="mt-12">
          <div
            data-reveal
            className="border-b border-line pb-3"
          >
            <h2
              id={`tahun-${year}-title`}
              aria-label={String(year)}
              className="font-display text-2xl leading-none"
            >
              {year}
            </h2>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {archivePosts
              .filter((post) => post.year === year)
              .map((post) => {
                const project = curated.get(post.shortcode);
                const dateLabel = formatDate(locale, post.date);
                const meta = [
                  dateLabel,
                  dict.gallery.photos.replace(
                    "{count}",
                    String(post.photos)
                  ),
                  post.hasVideo ? dict.gallery.hasVideo : "",
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <li key={post.shortcode} className="flex flex-col gap-2">
                    {project ? (
                      <Link
                        href={`/${locale}/projects/${project.slug}`}
                        className="focus-ring group relative block aspect-[4/3] overflow-hidden rounded-sm bg-subtle"
                      >
                        <MediaImage
                          src={post.cover.src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                          className="object-cover transition-[scale] duration-500 group-hover:scale-[1.03]"
                        />
                        <span aria-hidden="true" className="photo-veil" />
                        <span className="label-plate absolute left-2 top-2">
                          {dict.gallery.curatedBadge}
                        </span>
                      </Link>
                    ) : (
                      <ArchivePostButton
                        href={instagramPost(post.shortcode)}
                        ariaLabel={`${dict.gallery.openOnInstagram} · ${dateLabel}`}
                        className="focus-ring group relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-subtle"
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                        cover={post.cover}
                        excerpt={post.excerpt}
                        meta={meta}
                        photos={post.photos}
                        labels={{
                          viewPhoto: dict.gallery.viewPhoto,
                          viewer: dict.detail.viewer,
                          close: dict.detail.close,
                          openOnInstagram: dict.gallery.openOnInstagram,
                          note: dict.gallery.viewNote,
                        }}
                      >
                        <span aria-hidden="true" className="photo-veil" />
                        <span
                          aria-hidden="true"
                          className="label-plate absolute right-2 top-2"
                        >
                          <ArrowIcon className="size-3" />
                        </span>
                      </ArchivePostButton>
                    )}

                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] uppercase tracking-wide text-ink-3">
                        {meta}
                      </p>
                      {post.excerpt ? (
                        <p
                          data-quote=""
                          className="line-clamp-2 text-[13px] leading-snug text-ink-2"
                        >
                          {post.excerpt}
                        </p>
                      ) : null}
                      {project ? (
                        <Link
                          href={`/${locale}/projects/${project.slug}`}
                          className="focus-ring w-fit text-xs font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
                        >
                          {pickLocalized(project.title, locale, project.slug)}{" "}
                          <ArrowIcon />
                        </Link>
                      ) : (
                        <DirectionalLink
                          href={instagramPost(post.shortcode)}
                          target="_blank"
                          rel="noopener"
                          rest
                          className="w-fit text-xs text-ink-2"
                        >
                          {dict.gallery.openOnInstagram}{" "}
                          <ArrowIcon />
                        </DirectionalLink>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </section>
  );
}
