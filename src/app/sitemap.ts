import type { MetadataRoute } from "next";
import {
  getPublishedProjects,
  getPublishedQuestions,
  getPublishedServices,
} from "@/lib/content";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/**
 * Peta situs: rute statis dua bahasa + seluruh proyek terbit, dengan
 * pasangan bahasa (alternates) agar paritas ID/EN dikenali. `lastModified`
 * hanya diisi dari waktu sunting data yang benar-benar dirender halaman
 * (dokumen §13.1.5) — bukan waktu request untuk semua halaman. Halaman teks
 * tetap tanpa data berwaktu tidak diberi lastModified. Dinamis supaya
 * publikasi/penarikan proyek langsung terdaftar.
 */
export const dynamic = "force-dynamic";

/** Tanggal paling baru dari daftar; null bila tidak ada yang punya. */
function latest(dates: (Date | null)[]): Date | null {
  return dates.reduce<Date | null>(
    (max, date) => (date && (!max || date > max) ? date : max),
    null
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services, faqs] = await Promise.all([
    getPublishedProjects(),
    getPublishedServices(),
    getPublishedQuestions(),
  ]);

  const projectDate = latest(projects.map((project) => project.updatedAt));
  const serviceDate = latest(services.map((service) => service.updatedAt));
  const faqDate = latest(faqs.map((faq) => faq.updatedAt));

  const staticPaths: { path: string; lastModified: Date | null }[] = [
    { path: "", lastModified: projectDate },
    { path: "/projects", lastModified: projectDate },
    { path: "/gallery", lastModified: projectDate },
    { path: "/services", lastModified: serviceDate },
    { path: "/faq", lastModified: faqDate },
    // Halaman teks tetap (about, privasi, kontak, bantuan) tidak punya data
    // berwaktu — biarkan crawler memakai sinyalnya sendiri.
    { path: "/about", lastModified: null },
    { path: "/contact", lastModified: null },
    { path: "/help", lastModified: null },
    { path: "/privacy", lastModified: null },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, lastModified } of staticPaths) {
    const languages = { id: `${BASE}/id${path}`, en: `${BASE}/en${path}` };
    for (const url of [languages.id, languages.en]) {
      entries.push({
        url,
        ...(lastModified ? { lastModified } : {}),
        alternates: { languages },
      });
    }
  }

  for (const project of projects) {
    const languages = {
      id: `${BASE}/id/projects/${project.slug}`,
      en: `${BASE}/en/projects/${project.slug}`,
    };
    for (const url of [languages.id, languages.en]) {
      entries.push({
        url,
        ...(project.updatedAt ? { lastModified: project.updatedAt } : {}),
        alternates: { languages },
      });
    }
  }

  return entries;
}
