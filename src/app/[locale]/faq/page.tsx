import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import { getPublishedQuestions, getPublicSettings } from "@/lib/content";
import { pickLocalized } from "@/lib/view-models";
import { applySiteSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, pageJsonLd } from "@/lib/seo";
import { Accordion } from "@/components/ui/accordion";
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
    title: dict.faqPage.metaTitle,
    description: dict.faqPage.metaDescription,
    alternates: {
      languages: { en: "/en/faq", id: "/id/faq" },
    },
  };
}

/**
 * Halaman Pertanyaan Umum. Isinya dari tabel `faqs` (hanya jawaban yang
 * disetujui & terbit) — satu tempat untuk FAQ, sehingga halaman Layanan
 * cukup menautkan ke sini. Akordeonnya eksklusif: membuka satu menutup
 * yang lain.
 */
export default async function FaqPage({
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

  const questionRows = await getPublishedQuestions();
  const items = questionRows
    .map((item) => ({
      question: pickLocalized(item.question, locale, ""),
      answer: pickLocalized(item.answer, locale, ""),
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0);

  return (
    <>
      <section className="shell pt-14 pb-10 sm:pt-16">
        <Breadcrumbs
          label={dict.breadcrumb.label}
          items={[
            { label: dict.breadcrumb.home, href: `/${locale}` },
            { label: dict.faqPage.title },
          ]}
          className="mb-6"
        />
        <JsonLd
          data={[
            pageJsonLd({
              locale,
              path: "/faq",
              name: dict.faqPage.title,
              description: dict.faqPage.metaDescription,
            }),
            breadcrumbJsonLd([
              { name: dict.breadcrumb.home, path: `/${locale}` },
              { name: dict.faqPage.title, path: `/${locale}/faq` },
            ]),
          ]}
        />
        <div data-reveal className="max-w-2xl">
          <h1 className="font-display text-balance text-4xl leading-tight sm:text-5xl">
            {dict.faqPage.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            {dict.faqPage.intro}
          </p>
        </div>
      </section>

      <section className="shell pb-16 sm:pb-20">
        {items.length > 0 ? (
          <div data-reveal className="max-w-3xl">
            <Accordion items={items} />
          </div>
        ) : (
          <div className="max-w-2xl rounded-md border border-line bg-surface p-6">
            <p className="text-sm leading-relaxed text-ink-2">
              {dict.faqPage.empty}
            </p>
          </div>
        )}

        <div
          data-reveal
          className="mt-12 max-w-2xl rounded-md border border-line bg-surface p-6 sm:p-8"
        >
          <h2 className="font-display text-balance text-2xl leading-snug sm:text-3xl">
            {dict.faqPage.ctaTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2 sm:text-base">
            {dict.faqPage.ctaBody}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <WhatsAppButton
              message={dict.wa.faq}
              label={dict.hero.ctaPrimary}
            />
            <Link href={`/${locale}/services`} className="btn btn-secondary">
              {dict.faqPage.servicesLink}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
