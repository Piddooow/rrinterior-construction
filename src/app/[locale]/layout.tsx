import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import {
  defaultLocale,
  getDictionary,
  isLocale,
  locales,
  type Locale,
} from "@/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GradualBlur } from "@/components/ui/gradual-blur";
import { PageTransition } from "@/components/ui/page-transition";
import { ImageGuard } from "@/components/image-guard";
import {
  getPublicSettings,
  getPublishedProjects,
  getPublishedServices,
} from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { applySiteSettings } from "@/lib/settings";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const headScript = `(function(){document.documentElement.setAttribute('data-js','1');try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion');setTimeout(function(){if(!window.__rrMotion)document.documentElement.classList.remove('motion')},2500)}}catch(e){}})();`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale);
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      languages: { en: "/en", id: "/id" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
      images: [
        {
          url: "/mock/hero-living.webp",
          width: 1440,
          height: 803,
          alt: dict.hero.imageAlt,
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#FFFCEF",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Teks situs (pesan WhatsApp & teks persiapan) dapat diubah lewat pengaturan.
  // Layanan & proyek terbaru dipakai bilah navigasi — satu putaran paralel.
  const [settings, serviceRows, projectRows] = await Promise.all([
    getPublicSettings(),
    getPublishedServices(),
    getPublishedProjects(),
  ]);
  const dict = applySiteSettings(
    getDictionary(locale as Locale),
    settings,
    locale as Locale
  );
  const latestProject = projectRows.reduce<(typeof projectRows)[number] | null>(
    (latest, project) =>
      !latest || (project.yearCompleted ?? 0) > (latest.yearCompleted ?? 0)
        ? project
        : latest,
    null
  );

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        {/*
         * Skrip pra-cat dikirim dari HTML server sebagai string innerHTML,
         * bukan elemen <script> milik React. Parser peramban tetap
         * mengeksekusinya saat muat pertama (sebelum konten di bawahnya
         * dicat), sementara remount layout — mis. saat ganti bahasa — tidak
         * lagi memicu peringatan React "Encountered a script tag while
         * rendering React component". Isinya statis, tanpa input pengguna.
         */}
        <div
          hidden
          dangerouslySetInnerHTML={{
            __html: `<script id="head-init">${headScript}</script>`,
          }}
        />
        {/* Tanpa JS: tirai boot (R14a) tidak boleh menutupi konten. */}
        <noscript>
          <style>{`[data-page-transition] { display: none !important; }`}</style>
        </noscript>
        <GradualBlur />
        <ImageGuard />
        <a href="#main" className="skip-link">
          {dict.skipToContent}
        </a>
        <SiteHeader
          locale={locale as Locale}
          dict={dict}
          services={serviceRows}
          latestProject={latestProject}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale as Locale} dict={dict} />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <PageTransition />
      </body>
    </html>
  );
}
