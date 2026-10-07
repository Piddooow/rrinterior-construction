import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import { getPublicSettings } from "@/lib/content";
import { applySiteSettings } from "@/lib/settings";
import { SITE, waHref } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageJsonLd } from "@/lib/seo";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { MediaImage } from "@/components/ui/media-image";
import { DirectionalLink } from "@/components/ui/directional-link";
import { FounderHoverCard } from "@/components/ui/founder-hover-card";
import { getInstagramFollowers } from "@/lib/instagram";

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
    title: dict.aboutPage.metaTitle,
    description: dict.aboutPage.metaDescription,
    alternates: {
      languages: { en: "/en/about", id: "/id/about" },
    },
  };
}

export default async function AboutPage({
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
  const waBase = waHref(dict.wa.base);
  // Angka pengikut resmi (R14j); null menyembunyikan angka sepenuhnya.
  const followers = await getInstagramFollowers();

  return (
    <>
      <section className="shell pt-14 sm:pt-16">
        <Breadcrumbs
          label={dict.breadcrumb.label}
          items={[
            { label: dict.breadcrumb.home, href: `/${locale}` },
            { label: dict.aboutPage.title },
          ]}
          className="mb-6"
        />
        <JsonLd
          data={[
            pageJsonLd({
              locale,
              path: "/about",
              name: dict.aboutPage.title,
              description: dict.aboutPage.metaDescription,
            }),
            breadcrumbJsonLd([
              { name: dict.breadcrumb.home, path: `/${locale}` },
              { name: dict.aboutPage.title, path: `/${locale}/about` },
            ]),
          ]}
        />
        <div data-reveal className="max-w-2xl">
          <h1 className="font-display text-balance text-4xl leading-tight sm:text-5xl">
            {dict.aboutPage.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            {dict.aboutPage.intro}
          </p>
        </div>
      </section>

      <section
        className="shell py-12 sm:py-14"
        aria-labelledby="about-title"
      >
        <div data-reveal className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="max-w-xl">
            <h2
              id="about-title"
              className="font-display text-balance text-3xl leading-tight sm:text-4xl"
            >
              {dict.about.title}
            </h2>
            {dict.about.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-5 text-base leading-relaxed text-ink-2"
              >
                {paragraph}
              </p>
            ))}
            <dl className="mt-8 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-3">{dict.about.facts.studio}</dt>
                <dd className="mt-0.5 text-ink">RR Design &amp; Build</dd>
              </div>
              <div>
                <dt className="text-ink-3">{dict.about.facts.area}</dt>
                <dd className="mt-0.5 text-ink">
                  {dict.about.facts.areaValue}
                </dd>
              </div>
              <div>
                <dt className="text-ink-3">{dict.about.facts.instagram}</dt>
                <dd className="mt-0.5">
                  <DirectionalLink
                    href={SITE.instagram}
                    target="_blank"
                    rel="noopener"
                    rest
                    className="inline-flex min-h-11 items-center lg:min-h-0"
                  >
                    {SITE.instagramHandle}
                  </DirectionalLink>
                </dd>
              </div>
              <div>
                <dt className="text-ink-3">{dict.about.facts.whatsapp}</dt>
                <dd className="mt-0.5">
                  <DirectionalLink
                    href={waBase}
                    target="_blank"
                    rel="noopener"
                    rest
                    className="inline-flex min-h-11 items-center lg:min-h-0"
                  >
                    {SITE.phoneDisplay}
                  </DirectionalLink>
                </dd>
              </div>
            </dl>
            <p
              data-founder-line
              className="mt-8 text-base leading-relaxed text-ink-2"
            >
              {dict.founder.lead}{" "}
              <FounderHoverCard
                name={SITE.founder.name}
                role={dict.founder.role}
                href={SITE.founder.instagram}
                handle={SITE.founder.instagramHandle}
                photoSrc="/people/rangga.jpg"
                photoAlt={dict.founder.photoAlt}
                credit={dict.founder.photoCredit}
                followers={followers?.followers ?? null}
                followersLabel={dict.founder.followers}
                locale={locale}
              />
              .
            </p>
          </div>

          <div className="grid grid-cols-2 items-start gap-4 sm:gap-5">
            <figure className="group relative overflow-hidden rounded-md bg-subtle">
              <MediaImage
                src="/work/kitchen-set-design/02.webp"
                alt={dict.about.kitchenAlt}
                width={1440}
                height={810}
                sizes="(min-width: 1024px) 320px, 45vw"
                data-parallax
                className="aspect-[4/3] w-full object-cover"
              />
              <span aria-hidden="true" className="photo-veil" />
              <figcaption className="label-plate absolute left-3 top-3">
                {dict.work.roleRender}
              </figcaption>
            </figure>
            <figure className="group relative mt-8 overflow-hidden rounded-md bg-subtle">
              <MediaImage
                src="/mock/work-cikarang.jpg"
                alt={dict.about.siteAlt}
                width={1080}
                height={1350}
                priority
                sizes="(min-width: 1024px) 320px, 45vw"
                data-parallax
                className="aspect-[4/5] w-full object-cover"
              />
              <span aria-hidden="true" className="photo-veil" />
              <figcaption className="label-plate absolute left-3 top-3">
                {dict.work.roleSite}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="shell pb-16 sm:pb-20">
        <div data-reveal className="flex flex-wrap items-center gap-3">
          <WhatsAppButton
            message={dict.wa.about}
            label={dict.hero.ctaPrimary}
          />
          <Link href={`/${locale}/projects`} className="btn btn-secondary">
            {dict.aboutPage.projectsLink}
          </Link>
        </div>
      </section>
    </>
  );
}
