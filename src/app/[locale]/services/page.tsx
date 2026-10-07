import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import {
  getPublishedProcessSteps,
  getPublishedServices,
  getPublishedTestimonials,
  getPublicSettings,
} from "@/lib/content";
import { pickLocalized } from "@/lib/view-models";
import { applySiteSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceGrid } from "@/components/service-grid";
import { ProcessSection } from "@/components/process-section";
import { TestimonialsFaq } from "@/components/testimonials-faq";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ScrollSpine } from "@/components/ui/scroll-spine";
import { StickyStack } from "@/components/ui/sticky-stack";
import { PREP_ART } from "@/components/ui/prep-art";

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
    title: dict.servicesPage.metaTitle,
    description: dict.servicesPage.metaDescription,
    alternates: {
      languages: { en: "/en/services", id: "/id/services" },
    },
  };
}

export default async function ServicesPage({
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

  const [serviceRows, stepRows, testimonialRows] = await Promise.all([
    getPublishedServices(),
    getPublishedProcessSteps(),
    getPublishedTestimonials(),
  ]);

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

  const testimonials = testimonialRows.map((item) => ({
    quote: pickLocalized(item.quote, locale, ""),
    author: item.author,
    context: item.context ? pickLocalized(item.context, locale, "") : "",
  }));

  const spineItems = [
    { id: "services", label: dict.services.title },
    { id: "process", label: dict.process.title },
    { id: "proof", label: dict.proof.testimonialsTitle },
    { id: "prep", label: dict.servicesPage.prepTitle },
  ];

  return (
    <>
      <section className="shell relative overflow-hidden pt-14 sm:pt-16">
        <div
          aria-hidden="true"
          data-hero-bg
          className="pointer-events-none absolute -right-6 top-0 -z-10 hidden h-full w-1/2 sm:block"
          style={{
            maskImage: "linear-gradient(to left, black, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          }}
        >
          <Image
            src="/work/house-renovation-documentation/02.jpg"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover opacity-[0.14]"
          />
        </div>
        <Breadcrumbs
          label={dict.breadcrumb.label}
          items={[
            { label: dict.breadcrumb.home, href: `/${locale}` },
            { label: dict.servicesPage.title },
          ]}
          className="mb-6"
        />
        <div data-reveal className="max-w-2xl">
          <h1 className="font-display text-balance text-4xl leading-tight sm:text-5xl">
            {dict.servicesPage.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            {dict.servicesPage.intro}
          </p>
        </div>
      </section>

      <div className="shell mt-12 grid gap-x-14 gap-y-16 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="flex min-w-0 flex-col gap-16 lg:gap-20">
          <section id="services" aria-labelledby="services-title">
            <div className="max-w-2xl">
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
          </section>

          {/* Proses konsultasi — komponen bersama dengan Beranda (H4). */}
          <ProcessSection dict={dict} steps={steps} />

          {/* Testimoni tampil di sini; pertanyaan umum tinggal di halaman FAQ
              agar tidak ada dua daftar yang sama (tautan ada di kartu bawah). */}
          <div id="proof">
            <TestimonialsFaq
              bare
              testimonials={testimonials}
              faqs={[]}
              labels={{
                testimonialsTitle: dict.proof.testimonialsTitle,
                testimonialsLead: dict.proof.testimonialsLead,
                faqTitle: dict.proof.faqTitle,
                prev: dict.proof.testimonialsPrev,
                next: dict.proof.testimonialsNext,
              }}
            />
          </div>

          {/* Persiapan awal: menegaskan boleh mulai tanpa ukuran/anggaran/
              desain final — versi dek yang bisa ditelusuri satu per satu. */}
          <section
            id="prep"
            aria-labelledby="prep-title"
            className="pb-16 sm:pb-20"
          >
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start">
              <div>
                <h2
                  id="prep-title"
                  className="font-display text-balance text-2xl leading-snug sm:text-3xl"
                >
                  {dict.servicesPage.prepTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-2 sm:text-base">
                  {dict.servicesPage.prepBody}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <WhatsAppButton
                    message={dict.wa.services}
                    label={dict.process.cta}
                    className="w-fit"
                  />
                  <Link href={`/${locale}/faq`} className="btn btn-secondary">
                    {dict.proof.faqLink}
                  </Link>
                </div>
              </div>
              <StickyStack
                items={dict.servicesPage.prepStack.items}
                art={PREP_ART}
                label={dict.servicesPage.prepStack.region}
                heading={
                  <>
                    <h3 className="font-display text-xl leading-snug">
                      {dict.servicesPage.prepStack.title}
                    </h3>
                    <p className="text-sm text-ink-3">
                      {dict.servicesPage.prepStack.hint}
                    </p>
                  </>
                }
              />
            </div>
          </section>
        </div>

        {/* Rel "Di halaman ini" — hanya layar lebar, karena pita butuh ruang
            di samping konten. */}
        <aside className="hidden lg:block" aria-label={dict.pageSpine.label}>
          <div className="sticky top-24">
            <p className="mb-4 text-xs font-medium tracking-[0.06em] text-ink-3 uppercase">
              {dict.pageSpine.label}
            </p>
            <ScrollSpine
              items={spineItems}
              height={280}
              label={dict.pageSpine.label}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
