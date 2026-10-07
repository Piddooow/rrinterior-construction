import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import { getPublishedProjectBySlug, getPublishedProjectMedia, getPublicSettings } from "@/lib/content";
import { pickLocalized, toProjectCard } from "@/lib/view-models";
import { applySiteSettings } from "@/lib/settings";
import { ProjectLabels } from "@/components/project-labels";
import { ProjectGallery } from "@/components/project-gallery";
import { RoleHint } from "@/components/ui/role-hint";
import { MediaImage } from "@/components/ui/media-image";
import { DirectionalLink } from "@/components/ui/directional-link";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShareProjectButton } from "@/components/share-project-button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { BrandLogo } from "@/components/brand-mark";

/**
 * Dinamis per request: status terbit dicek langsung dari database,
 * sehingga proyek yang ditarik dari publikasi langsung 404 (tanpa
 * jendela cache ISR).
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return { title: dict.meta.title };

  const title = pickLocalized(project.title, locale, project.slug);
  const scope = pickLocalized(project.scopeOfWork, locale, "");
  const year = project.yearCompleted ? String(project.yearCompleted) : "";
  const fallbackDescription = [scope, project.generalLocation ?? "", year]
    .filter(Boolean)
    .join(" · ");
  const description =
    pickLocalized(project.summary, locale, "") ||
    fallbackDescription ||
    dict.meta.description;
  const canonical = `/${locale}/projects/${project.slug}`;
  const coverUrl = project.cover?.url ?? "/mock/hero-living.webp";
  const coverAlt = project.cover
    ? pickLocalized(project.cover.alt, locale, title)
    : dict.hero.imageAlt;

  return {
    title: `${title} | RR Design & Build`,
    description,
    alternates: {
      canonical,
      languages: {
        en: `/en/projects/${project.slug}`,
        id: `/id/projects/${project.slug}`,
      },
    },
    // Preview tautan (WhatsApp/sosial) memakai foto utama proyek.
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "RR Design & Build",
      type: "website",
      images: [{ url: coverUrl, alt: coverAlt }],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = applySiteSettings(
    getDictionary(locale),
    await getPublicSettings(),
    locale
  );

  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const card = toProjectCard(project, locale, dict);
  const summary = pickLocalized(project.summary, locale, "");
  const scope = pickLocalized(project.scopeOfWork, locale, "");
  // Galeri dari pustaka media nyata (media_assets + project_media):
  // hanya berkas siap & disetujui, urut sesuai relasi.
  const gallery = await getPublishedProjectMedia(project.slug);

  return (
    // Sejak R15a halaman detail memakai tema terang menyeluruh; pelat label
    // dan redup penampil foto tetap gelap secara fungsional di atas foto.
    <div className="bg-canvas text-ink">
      <section className="shell pb-16 pt-10 sm:pb-20">
        <Breadcrumbs
          label={dict.breadcrumb.label}
          items={[
            { label: dict.breadcrumb.home, href: `/${locale}` },
            { label: dict.directory.title, href: `/${locale}/projects` },
            { label: card.title },
          ]}
          className="mb-4"
        />
        <Link
          href={`/${locale}/projects`}
          className="focus-ring inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink lg:min-h-0"
        >
          <ArrowIcon className="rotate-[-135deg]" />
          {dict.detail.back}
        </Link>

        <h1 data-reveal className="mt-6 font-display text-balance text-4xl leading-tight sm:text-5xl">
          {card.title}
        </h1>
        <ProjectLabels location={card.location} status={card.status} />
        {/* Legenda label media: hover/fokus/ketuk untuk penjelasan singkat —
            jawaban atas pertanyaan pertama pengunjung (render vs foto asli).
            Badge di galeri tidak dibuat interaktif karena berada di dalam
            tombol pembuka penampil (interaktif bersarang tidak valid). */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
          <span>{dict.detail.labelLegend}</span>
          <RoleHint
            note={{
              label: dict.work.roleRender,
              body: dict.detail.renderHint,
              href: `/${locale}/faq`,
              linkLabel: dict.detail.hintLink,
            }}
          />
          <RoleHint
            note={{
              label: dict.work.roleSite,
              body: dict.detail.siteHint,
              href: `/${locale}/faq`,
              linkLabel: dict.detail.hintLink,
            }}
          />
        </div>
        {summary ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
            {summary}
          </p>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <figure data-reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-subtle">
              {card.image ? (
                <MediaImage
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 760px, 100vw"
                  data-parallax
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <BrandLogo className="h-11 w-11 opacity-50" />
                  <p className="text-xs leading-relaxed text-ink-3">
                    {dict.work.photoFallback}
                  </p>
                </div>
              )}
              {card.image && card.role ? (
                <span className="label-plate absolute left-4 top-4">
                  {card.role === "render"
                    ? dict.work.roleRender
                    : dict.work.roleSite}
                </span>
              ) : null}
            </div>
            {gallery.length === 0 ? (
              <figcaption className="mt-3 text-xs text-ink-3">
                {dict.detail.moreMediaSoon}
              </figcaption>
            ) : null}
          </figure>

          <div data-reveal className="flex flex-col gap-6">
            <dl className="grid gap-4 text-sm">
              {scope ? (
                <div>
                  <dt className="text-ink-3">{dict.detail.scopeLabel}</dt>
                  <dd className="mt-0.5 text-ink">{scope}</dd>
                </div>
              ) : null}
              {project.yearCompleted ? (
                <div>
                  <dt className="text-ink-3">{dict.detail.yearLabel}</dt>
                  <dd className="mt-0.5 text-ink">{project.yearCompleted}</dd>
                </div>
              ) : null}
              {project.sourcePost ? (
                <div>
                  <dt className="text-ink-3">{dict.detail.sourceLabel}</dt>
                  <dd className="mt-0.5">
                    <DirectionalLink
                      href={`https://www.instagram.com/rrinterior.construction/p/${project.sourcePost}/`}
                      target="_blank"
                      rel="noopener"
                      rest
                      className="inline-flex min-h-11 items-center lg:min-h-0"
                    >
                      {dict.detail.sourcePost}
                    </DirectionalLink>
                  </dd>
                </div>
              ) : null}
            </dl>
            <WhatsAppButton
              message={card.waMessage}
              label={dict.detail.discuss}
              className="w-fit"
            />
            <ShareProjectButton
              title={card.title}
              labels={{
                share: dict.detail.share,
                copyLink: dict.detail.copyLink,
                linkCopied: dict.detail.linkCopied,
                copyLinkFailed: dict.detail.copyLinkFailed,
                shareLinkFailed: dict.detail.shareLinkFailed,
                close: dict.detail.close,
              }}
            />
          </div>
        </div>

        {gallery.length > 0 ? (
          <section data-reveal className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-2xl leading-snug sm:text-3xl">
              {dict.detail.galleryTitle}
            </h2>
            <ProjectGallery
              items={gallery.map((item) => ({
                src: item.src,
                alt: pickLocalized(item.alt, locale, ""),
                role: item.role,
                order: item.order,
                type: item.type,
                poster: item.poster ?? undefined,
                credit: item.credit ?? undefined,
              }))}
              labels={{
                render: dict.work.roleRender,
                site: dict.work.roleSite,
                video: dict.detail.videoLabel,
                viewer: dict.detail.viewer,
                close: dict.detail.close,
                prev: dict.detail.prev,
                next: dict.detail.next,
                counter: dict.detail.counter,
                videoCounter: dict.detail.videoCounter,
                credit: dict.detail.sourceLabel,
              }}
            />
          </section>
        ) : null}
      </section>
    </div>
  );
}
