import type { Locale } from "@/i18n";
import { SITE } from "@/lib/site";

/**
 * Structured data (JSON-LD) — dokumen §14. Prinsip: hanya data nyata yang
 * konsisten dengan halaman terlihat (nama, URL, logo, kanal resmi), tanpa
 * klaim rich result. Serializer menetralkan `<` agar payload aman saat
 * dimasukkan ke HTML — bukan sekadar JSON.stringify.
 */

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Serialize aman untuk `<script type="application/ld+json">`. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** URL absolut dari path internal; URL luar (mis. CDN) dibiarkan apa adanya. */
export function absoluteAsset(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Identitas organisasi (site-wide, dari kanal resmi yang terverifikasi). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE}/#organization`,
    name: "RR Design & Build",
    url: BASE,
    logo: `${BASE}/brand/color-rr-logo-coklat.webp`,
    email: SITE.email,
    sameAs: [SITE.instagram],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: `+${SITE.whatsappNumber}`,
        url: `https://wa.me/${SITE.whatsappNumber}`,
        availableLanguage: ["id", "en"],
      },
    ],
  };
}

/** Situs itu sendiri (dwibahasa), ditautkan ke organisasi. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    name: "RR Design & Build",
    url: BASE,
    inLanguage: ["id", "en"],
    publisher: { "@id": `${BASE}/#organization` },
  };
}

type Crumb = { name: string; path: string };

/** Remah navigasi — `path` sudah memuat locale (mis. "/id/services"). */
export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE}${item.path}`,
    })),
  };
}

type PageJsonLdInput = {
  locale: Locale;
  /** Path tanpa locale, mis. "/services"; "" untuk beranda. */
  path: string;
  name: string;
  description?: string | null;
  type?: "WebPage" | "CollectionPage";
};

/** Halaman publik umum (WebPage) atau daftar (CollectionPage). */
export function pageJsonLd(input: PageJsonLdInput) {
  const url = `${BASE}/${input.locale}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    "@id": `${url}#page`,
    url,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    inLanguage: input.locale,
    isPartOf: { "@id": `${BASE}/#website` },
  };
}

/**
 * Proyek portofolio = karya (CreativeWork) — bukan Product/review/rating
 * (dokumen §14.1.2). Field hanya diisi bila datanya nyata.
 */
export function projectJsonLd(input: {
  locale: Locale;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  year?: number | null;
  location?: string | null;
}) {
  const url = `${BASE}/${input.locale}/projects/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: input.name,
    url,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: absoluteAsset(input.image) } : {}),
    ...(input.year ? { dateCreated: String(input.year) } : {}),
    ...(input.location
      ? { locationCreated: { "@type": "Place", name: input.location } }
      : {}),
    inLanguage: input.locale,
    creator: { "@id": `${BASE}/#organization` },
    isPartOf: { "@id": `${BASE}/#website` },
  };
}
