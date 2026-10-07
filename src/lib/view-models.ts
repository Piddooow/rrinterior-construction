import type { Dictionary, Locale } from "@/i18n";
import type { LocalizedText, PublicProject } from "@/lib/content";
import { SITE, absoluteUrl } from "@/lib/site";

/** Ambil teks sesuai locale dengan fallback lintas bahasa. */
export function pickLocalized(
  text: LocalizedText,
  locale: Locale,
  fallback: string
): string {
  return text[locale] ?? text.en ?? text.id ?? fallback;
}

export type ProjectCardView = {
  slug: string;
  title: string;
  meta: string;
  location: string;
  status: string;
  role: "render" | "foto_lapangan" | null;
  image: { src: string; alt: string } | null;
  waMessage: string;
};

/** Bentuk data kartu proyek yang dipakai beranda dan direktori. */
export function toProjectCard(
  project: PublicProject,
  locale: Locale,
  dict: Dictionary
): ProjectCardView {
  const typeLabel = pickLocalized(project.scopeOfWork, locale, "");
  const year = project.yearCompleted ? String(project.yearCompleted) : "";
  const location = project.generalLocation ?? "";
  const metaParts = [typeLabel, year].filter(Boolean);
  const title = pickLocalized(project.title, locale, project.slug);
  const details = [typeLabel, location, year].filter(Boolean).join(" · ");
  // Tautan postingan Instagram asli (shortcode tersimpan di source_post);
  // fallback ke profil bila proyek tidak berasal dari satu unggahan.
  const sourcePost = project.sourcePost
    ? `https://www.instagram.com/p/${project.sourcePost}/`
    : SITE.instagram;

  return {
    slug: project.slug,
    title,
    meta: metaParts.join(" · "),
    location,
    status:
      project.projectStatus === "berjalan"
        ? dict.work.statusBerjalan
        : project.projectStatus === "selesai"
          ? dict.work.statusSelesai
          : "",
    role: project.cover?.role ?? null,
    image: project.cover
      ? {
          src: project.cover.url,
          alt: pickLocalized(project.cover.alt, locale, title),
        }
      : null,
    waMessage: dict.wa.project
      .replace("{title}", title)
      .replace("{details}", details ? ` (${details})` : "")
      .replace("{url}", absoluteUrl(`/${locale}/projects/${project.slug}`))
      .replace("{post}", sourcePost),
  };
}
