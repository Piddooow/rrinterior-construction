import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/**
 * Peta situs (R5): rute statis dua bahasa + seluruh proyek yang sudah
 * terbit, lengkap dengan pasangan bahasa (alternates) agar mesin pencari
 * mengenali paritas ID/EN. Dinamis supaya proyek baru langsung terdaftar
 * (aksi admin juga memanggil revalidatePath untuk rute ini).
 */
export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/projects",
  "/services",
  "/about",
  "/contact",
  "/privacy",
  "/faq",
  "/help",
  "/gallery",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    const languages = { id: `${BASE}/id${path}`, en: `${BASE}/en${path}` };
    entries.push({
      url: languages.id,
      lastModified: now,
      alternates: { languages },
    });
    entries.push({
      url: languages.en,
      lastModified: now,
      alternates: { languages },
    });
  }

  const projects = await getPublishedProjects();
  for (const project of projects) {
    const lastModified = project.createdAt ?? now;
    const languages = {
      id: `${BASE}/id/projects/${project.slug}`,
      en: `${BASE}/en/projects/${project.slug}`,
    };
    entries.push({
      url: languages.id,
      lastModified,
      alternates: { languages },
    });
    entries.push({
      url: languages.en,
      lastModified,
      alternates: { languages },
    });
  }

  return entries;
}
