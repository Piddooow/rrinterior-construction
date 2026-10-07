import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
    title: dict.helpPage.metaTitle,
    description: dict.helpPage.metaDescription,
    alternates: {
      languages: { en: "/en/help", id: "/id/help" },
    },
  };
}

/**
 * Halaman Bantuan: panduan singkat memakai situs — membaca label media,
 * menyaring direktori, membagikan proyek, menghubungi RR, dan privasi.
 * Seluruh isi berasal dari fakta yang sudah ada di situs (tanpa harga,
 * janji, atau klaim di luar arsip), selaras dengan prinsip PRD.
 */
export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const copy = dict.helpPage;

  return (
    <section className="shell pt-14 pb-16 sm:pt-16 sm:pb-20">
      <Breadcrumbs
        label={dict.breadcrumb.label}
        items={[
          { label: dict.breadcrumb.home, href: `/${locale}` },
          { label: copy.title },
        ]}
        className="mb-6"
      />

      <div data-reveal className="max-w-2xl">
        <h1 className="font-display text-balance text-4xl leading-tight sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-2">
          {copy.intro}
        </p>
      </div>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {copy.sections.map((section, index) => (
          <li
            key={section.title}
            data-reveal
            className="rounded-md border border-line bg-surface p-6"
          >
            <span className="font-display text-sm text-ink-3 tabular-nums">
              /{String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-2 font-display text-xl leading-snug text-balance">
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {section.body}
            </p>
          </li>
        ))}
      </ol>

      <div
        data-reveal
        className="mt-10 rounded-md border border-line bg-subtle p-6 sm:p-8"
      >
        <h2 className="font-display text-2xl leading-snug">{copy.faqCta}</h2>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={`/${locale}/faq`} className="btn btn-primary">
            {copy.faqLink}
          </Link>
          <Link href={`/${locale}/services`} className="btn btn-secondary">
            {copy.servicesLink}
          </Link>
          <Link href={`/${locale}/contact`} className="btn btn-secondary">
            {copy.contactLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
