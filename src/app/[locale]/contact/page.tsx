import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import { getPublicSettings } from "@/lib/content";
import { channels } from "@/lib/mock";
import { applySiteSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageJsonLd } from "@/lib/seo";
import { WhatsAppButton } from "@/components/whatsapp-button";

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
    title: dict.contactPage.metaTitle,
    description: dict.contactPage.metaDescription,
    alternates: {
      languages: { en: "/en/contact", id: "/id/contact" },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  // Pesan & teks persiapan mengikuti pengaturan situs (bila sudah diisi).
  const dict = applySiteSettings(
    getDictionary(locale),
    await getPublicSettings(),
    locale
  );

  const [whatsapp, instagram] = channels;

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
            src="/work/modern-house-exterior/03.jpg"
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
            { label: dict.contactPage.title },
          ]}
          className="mb-6"
        />
        <JsonLd
          data={[
            pageJsonLd({
              locale,
              path: "/contact",
              name: dict.contactPage.title,
              description: dict.contactPage.metaDescription,
            }),
            breadcrumbJsonLd([
              { name: dict.breadcrumb.home, path: `/${locale}` },
              { name: dict.contactPage.title, path: `/${locale}/contact` },
            ]),
          ]}
        />
        <div data-reveal className="max-w-2xl">
          <h1 className="font-display text-balance text-4xl leading-tight sm:text-5xl">
            {dict.contactPage.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            {dict.contactPage.intro}
          </p>
        </div>
      </section>

      <section className="shell py-12 sm:py-14">
        <div className="grid gap-5 sm:grid-cols-2">
          <div data-reveal className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-display text-2xl leading-snug">
              {whatsapp.label[locale]}
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              {dict.contactPage.whatsappBody}
            </p>
            <div className="mt-auto flex flex-col items-start gap-3 pt-2">
              <WhatsAppButton
                message={dict.wa.contact}
                label={dict.contact.whatsapp}
              />
            </div>
          </div>

          <div data-reveal className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-display text-2xl leading-snug">
              {instagram.label[locale]}
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              {dict.contactPage.instagramBody}
            </p>
            <div className="mt-auto pt-2">
              <a
                href={instagram.href}
                target="_blank"
                rel="noopener"
                className="btn btn-secondary"
              >
                {instagram.handle}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Persiapan awal (teks dari pengaturan) + tautan lanjutan. */}
      <section className="shell pb-16 sm:pb-20" aria-labelledby="prep-title">
        <div data-reveal className="max-w-2xl rounded-md border border-line bg-surface p-6 sm:p-8">
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
            <Link href={`/${locale}/services`} className="btn btn-secondary">
              {dict.contactPage.servicesLink}
            </Link>
            <Link href={`/${locale}/projects`} className="btn btn-secondary">
              {dict.contactPage.projectsLink}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
