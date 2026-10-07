import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import {
  getPublishedProcessSteps,
  getPublishedProjects,
  getPublishedServices,
  getPublishedTestimonials,
  getPublicSettings,
} from "@/lib/content";
import { pickLocalized, toProjectCard } from "@/lib/view-models";
import { sampleGallery } from "@/lib/sample-gallery";
import { applySiteSettings } from "@/lib/settings";
import { SITE, waHref } from "@/lib/site";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { WorkStrip } from "@/components/work-strip";
import { ProjectCard } from "@/components/project-card";
import { ServiceGrid } from "@/components/service-grid";
import { ProcessSection } from "@/components/process-section";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { StoryScroll } from "@/components/ui/story-scroll";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { MediaImage } from "@/components/ui/media-image";
import { WordRotator } from "@/components/ui/word-rotator";
import { CardStack, type StackCard } from "@/components/ui/card-stack";
import { ScrollExpand } from "@/components/ui/scroll-expand";
import { DirectionalLink } from "@/components/ui/directional-link";
import { FounderHoverCard } from "@/components/ui/founder-hover-card";
import { getInstagramFollowers } from "@/lib/instagram";

export const revalidate = 300;

export default async function HomePage({
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

  const [projectRows, serviceRows, stepRows, testimonialRows] =
    await Promise.all([
      getPublishedProjects(),
      getPublishedServices(),
      getPublishedProcessSteps(),
      getPublishedTestimonials(),
    ]);

  // Karya pilihan: terbaru → terlama (beranda), bukan urutan editorial
  // direktori; temuan baru selalu muncul lebih dulu.
  const works = [...projectRows]
    .sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    )
    .map((project, index) => ({
      ...toProjectCard(project, locale, dict),
      number: String(index + 1).padStart(2, "0"),
    }));

  // Foto lapangan untuk seksi "membuka" — dipakai juga sebagai pengecualian
  // dek Stack supaya tidak ada foto yang tampil dua kali di halaman ini.
  const EXPAND_PHOTO = "/work/clothing-store-bogor/02.jpg";

  // Dek About: foto galeri proyek nyata (non-sampul) dari arsip gallery —
  // sampul sudah tampil di strip "Karya pilihan", jadi dek memakai foto
  // lain agar tidak ada foto yang muncul dua kali di halaman ini (R2).
  const archiveCards: StackCard[] = projectRows.flatMap((project) =>
    (sampleGallery[project.slug] ?? [])
      .filter((item) => item.type !== "video" && item.src !== EXPAND_PHOTO)
      .map((item) => ({
        src: item.src,
        alt: pickLocalized(item.alt, locale, project.slug),
        title: pickLocalized(project.title, locale, project.slug),
        role:
          item.role === "render" ? dict.work.roleRender : dict.work.roleSite,
      })),
  );

  // Foto lapangan terpilih untuk seksi "membuka" (arsip nyata; judul, label,
  // dan pesan WhatsApp dari data proyeknya sendiri).
  const expandSource = projectRows.find(
    (project) => project.slug === "clothing-store-bogor",
  );
  const expandCard = expandSource
    ? toProjectCard(expandSource, locale, dict)
    : null;
  const expand =
    expandSource && expandCard
      ? {
          image: {
            src: EXPAND_PHOTO,
            alt: `${expandCard.title} · ${dict.work.roleSite}`,
          },
          title: expandCard.title,
          plate: dict.work.roleSite,
          ctaLabel: dict.work.cardCta,
          waMessage: expandCard.waMessage,
        }
      : null;

  const services = serviceRows.map((service) => ({
    number: service.number,
    title: pickLocalized(service.title, locale, service.slug),
    description: pickLocalized(service.description, locale, ""),
  }));

  const steps = stepRows.map((step) => ({
    number: step.number,
    title: pickLocalized(step.title, locale, ""),
    description: pickLocalized(step.description, locale, ""),
  }));

  const reviews = testimonialRows
    .map((item, index) => ({
      id: `tst-${String(index + 1).padStart(2, "0")}`,
      quote: pickLocalized(item.quote, locale, ""),
      author: item.author,
      context: item.context ? pickLocalized(item.context, locale, "") : "",
    }))
    .filter((item) => item.quote.length > 0);

  // Tiga frame narasi studio; fakta & tautan dilampirkan per indeks tetap.
  const storyFrames = dict.story.frames.map((frame, index) => ({
    ...frame,
    facts:
      index === 0
        ? [
            { label: dict.about.facts.studio, value: "RR Design & Build" },
            { label: dict.about.facts.area, value: dict.about.facts.areaValue },
          ]
        : undefined,
    links:
      index === 1
        ? [{ label: dict.story.ctaServices, href: `/${locale}/services` }]
        : index === 2
          ? [
              { label: dict.story.ctaWork, href: `/${locale}/projects` },
              { label: dict.story.ctaGallery, href: `/${locale}/gallery` },
            ]
          : undefined,
  }));

  return (
    <>
      {/* Identitas dan perkenalan */}
      <section data-hero className="shell pb-16 pt-14 sm:pt-20 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-14">
          <div data-hero-step className="max-w-2xl">
            <h1 className="font-display text-balance text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              <WordRotator
                prefix={dict.hero.rotator.prefix}
                words={dict.hero.rotator.words}
                conjunction={dict.hero.rotator.conjunction}
              />
            </h1>
            <p className="mt-6 max-w-[36rem] text-pretty text-base leading-relaxed text-ink-2 sm:text-lg">
              {dict.hero.body}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WhatsAppButton
                message={dict.wa.hero}
                label={dict.hero.ctaPrimary}
              />
              <a href="#work" className="btn btn-secondary">
                {dict.hero.ctaSecondary}
                <ArrowIcon />
              </a>
            </div>
          </div>
          <figure data-hero-step className="flex flex-col">
            {/* Tinggi foto mengikuti tinggi blok teks di kiri (R7b); ponsel
                tetap memakai rasio alami. Skala 1.08 memberi ruang gerak
                untuk parallax ±3.5% supaya tepi tidak pernah kosong. */}
            <div className="relative overflow-hidden rounded-md bg-subtle lg:flex-1">
              <MediaImage
                src="/mock/hero-living.webp"
                alt={dict.hero.imageAlt}
                width={1440}
                height={803}
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                data-parallax
                className="h-auto w-full lg:h-full lg:scale-[1.08] lg:object-cover"
              />
              <span aria-hidden="true" className="photo-veil" />
              <span className="label-plate absolute left-4 top-4">
                {dict.work.roleRender}
              </span>
            </div>
            <figcaption className="mt-3 text-xs text-ink-3">
              {dict.hero.imageCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Narasi studio: tiga frame tertahan (desktop, tanpa reduced-motion) */}
      <StoryScroll region={dict.story.region} frames={storyFrames} />

      {/* Karya pilihan (band lembut terang, R15a) */}
      <section
        id="work"
        data-band
        className="text-ink"
        aria-labelledby="work-title"
      >
        <div className="shell section-y">
          <div data-reveal className="max-w-2xl">
            <h2
              id="work-title"
              className="font-display text-balance text-3xl leading-tight sm:text-4xl"
            >
              {dict.work.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-2 sm:text-base">
              {dict.work.intro}
            </p>
          </div>

          {works.length === 0 ? (
            <p className="mt-10 text-sm text-ink-2">{dict.work.empty}</p>
          ) : (
            <WorkStrip labels={{ prev: dict.work.prev, next: dict.work.next }}>
            {works.map((item) => (
              <li
                key={item.slug}
                className="w-[78vw] shrink-0 snap-start sm:w-[320px] lg:w-[360px]"
              >
                <ProjectCard
                  card={item}
                  number={item.number}
                  badge={{
                    render: dict.work.roleRender,
                    site: dict.work.roleSite,
                  }}
                  cta={dict.work.cardCta}
                  photoFallback={dict.work.photoFallback}
                  href={`/${locale}/projects/${item.slug}`}
                />
              </li>
            ))}
            </WorkStrip>
          )}
          {works.length > 0 ? (
            <div className="mt-8">
              <a className="btn btn-secondary" href={`/${locale}/projects`}>
                {dict.work.viewAll}
              </a>
            </div>
          ) : null}
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-ink-3">
            {dict.work.footnote}
          </p>
        </div>
      </section>

      {/* Foto lapangan yang membuka saat digulir (Tahap H7) */}
      {expand ? <ScrollExpand {...expand} /> : null}

      {/* Layanan */}
      <section
        id="services"
        className="shell section-y"
        aria-labelledby="services-title"
      >
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="services-title"
            className="font-display text-balance text-3xl leading-tight sm:text-4xl"
          >
            {dict.services.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-2 sm:text-base">
            {dict.services.intro}
          </p>
        </div>
        <ServiceGrid services={services} empty={dict.services.empty} />
        {services.length > 0 ? (
          <div className="mt-8">
            <a className="btn btn-secondary" href={`/${locale}/services`}>
              {dict.services.viewAll}
            </a>
          </div>
        ) : null}
      </section>

      {/* Proses konsultasi — komponen bersama dengan halaman Layanan (H4) */}
      <div className="shell section-y">
        <ProcessSection dict={dict} steps={steps} />
      </div>

      {/* Ulasan klien (deck bertumpuk) */}
      {reviews.length > 0 ? (
        <section
          id="testimonials"
          className="bg-canvas text-ink"
          aria-labelledby="testimonials-title"
        >
          <div className="shell section-y">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <h2
                id="testimonials-title"
                className="font-display text-balance text-3xl leading-tight sm:text-4xl"
              >
                {dict.proof.testimonialsTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-2 sm:text-base">
                {dict.proof.testimonialsLead}
              </p>
            </div>
            <div className="mt-10 sm:mt-12">
              <StaggerTestimonials
                key={locale}
                items={reviews}
                labels={{
                  region: dict.proof.testimonialsTitle,
                  prev: dict.proof.testimonialsPrev,
                  next: dict.proof.testimonialsNext,
                }}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Profil bisnis — kipas Stack boleh meluber; klip di level full-bleed
          supaya sudut kartu terpotong tepat di tepi layar, bukan di dalam
          kolom (dan tidak pernah menambah gulir horizontal di ponsel). */}
      <div className="overflow-x-clip">
        <section
          id="about"
          className="shell section-y"
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
            <p
              data-founder-line
              className="mt-5 text-base leading-relaxed text-ink-2"
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
            {/* Cakupan singkat: interior, pembangunan, jenis proyek, cara kerja
                (tanpa klaim tahun; tahun resmi menunggu RR). */}
            <dl className="mt-10 grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
              {dict.about.scope.map((item) => (
                <div
                  key={item.label}
                  className="border-t border-line-strong pt-3.5"
                >
                  <dt className="font-display text-base leading-snug">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 leading-relaxed text-ink-2">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            <dl className="mt-10 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
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
            <div className="mt-8">
              <a className="btn btn-secondary" href={`/${locale}/about`}>
                {dict.about.viewMore}
              </a>
            </div>
          </div>
          <CardStack
            items={archiveCards}
            labels={{
              region: dict.about.stackRegion,
              hint: dict.about.stackHint,
            }}
            className="mx-auto"
          />
        </div>
      </section>
      </div>

      {/* Penutup: satu ajakan memulai (R14f, mengikuti komposisi referensi
          yang disesuaikan ke rhythm seksi situs). Bingkai bergaris dengan
          penanda sudut ala gambar kerja, sorot radial tipis untuk fokus
          judul, dan dua CTA — semuanya dari kosakata visual yang sudah ada. */}
      <section aria-labelledby="closing-cta-title" className="shell section-y">
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-y-6 border-y border-line px-4 py-10 text-center sm:py-12">
          <PlusTick className="absolute -top-3 -left-3 size-6 text-ink-3" />
          <PlusTick className="absolute -top-3 -right-3 size-6 text-ink-3" />
          <PlusTick className="absolute -bottom-3 -left-3 size-6 text-ink-3" />
          <PlusTick className="absolute -right-3 -bottom-3 size-6 text-ink-3" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-y-6 left-0 w-px border-l border-line"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-y-6 right-0 w-px border-r border-line"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 -z-10 h-full border-l border-dashed border-line-strong/60"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(35%_80%_at_25%_0%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent)]"
          />
          <div className="space-y-2">
            <h2
              id="closing-cta-title"
              className="font-display text-balance text-2xl leading-tight sm:text-3xl"
            >
              {dict.closingCta.title}
            </h2>
            <p className="mx-auto max-w-xl text-pretty text-base leading-relaxed text-ink-2">
              {dict.closingCta.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a className="btn btn-secondary" href={`/${locale}/projects`}>
              {dict.hero.ctaSecondary}
              <ArrowIcon />
            </a>
            <WhatsAppButton
              message={dict.wa.hero}
              label={dict.hero.ctaPrimary}
            />
          </div>
        </div>
      </section>
    </>
  );
}

/** Tanda plus kecil untuk sudut bingkai seksi penutup (ala gambar kerja). */
function PlusTick({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
