import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, getDictionary, isLocale } from "@/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ScrollSpine } from "@/components/ui/scroll-spine";

/** Id bagian privasi: dipakai rel "Di halaman ini" dan tautan masa depan. */
const PRIVACY_SECTION_IDS = [
  "data-stored",
  "not-collected",
  "contact-channels",
  "if-this-changes",
] as const;

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
    title: dict.privacyPage.metaTitle,
    description: dict.privacyPage.metaDescription,
    alternates: {
      languages: { en: "/en/privacy", id: "/id/privacy" },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <>
      <section className="shell pt-14 sm:pt-16">
        <Breadcrumbs
          label={dict.breadcrumb.label}
          items={[
            { label: dict.breadcrumb.home, href: `/${locale}` },
            { label: dict.privacyPage.title },
          ]}
          className="mb-6"
        />
        <div data-reveal className="max-w-2xl">
          <h1 className="font-display text-balance text-4xl leading-tight sm:text-5xl">
            {dict.privacyPage.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            {dict.privacyPage.intro}
          </p>
        </div>
      </section>

      <section className="shell py-12 sm:py-14">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_180px]">
          <div className="flex max-w-2xl flex-col gap-10">
            {dict.privacyPage.sections.map((section, index) => (
              <div
                key={section.title}
                id={PRIVACY_SECTION_IDS[index]}
                data-reveal
              >
                <h2 className="font-display text-balance text-2xl leading-snug sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-2 sm:text-base">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          {/* Rel "Di halaman ini" — hanya layar lebar. */}
          <aside className="hidden lg:block" aria-label={dict.pageSpine.label}>
            <div className="sticky top-24">
              <p className="mb-4 text-xs font-medium tracking-[0.06em] text-ink-3 uppercase">
                {dict.pageSpine.label}
              </p>
              <ScrollSpine
                items={dict.privacyPage.sections.map((section, index) => ({
                  id: PRIVACY_SECTION_IDS[index],
                  label: section.title,
                }))}
                height={260}
                label={dict.pageSpine.label}
              />
            </div>
          </aside>
        </div>
      </section>

      <section className="shell pb-16 sm:pb-20">
        <div data-reveal className="max-w-2xl rounded-md border border-line bg-surface p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-ink-2 sm:text-base">
            {dict.privacyPage.questions}
          </p>
          <div className="mt-5">
            <Link href={`/${locale}/contact`} className="btn btn-secondary">
              {dict.privacyPage.contactLink}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
