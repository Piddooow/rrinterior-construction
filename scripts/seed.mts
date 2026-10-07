import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  faqs,
  mediaAssets,
  processSteps,
  projects,
  projectMedia,
  services,
  siteSettings,
  testimonials,
  type NewFaq,
  type NewMediaAsset,
  type NewProcessStep,
  type NewProject,
  type NewProjectMedia,
  type NewService,
  type NewSiteSetting,
  type NewTestimonial,
} from "../src/db/schema.ts";
import {
  faqs as mockFaqs,
  processSteps as mockSteps,
  services as mockServices,
  testimonials as mockTestimonials,
  works,
} from "../src/lib/mock.ts";
import { sampleGallery } from "../src/lib/sample-gallery.ts";
import { SITE } from "../src/lib/site.ts";

/**
 * Seed konten awal beranda (terpublikasi) — PostgreSQL.
 * Sumber: data yang sama dengan pratinjau frontend (src/lib/mock.ts),
 * berasal dari arsip publik RR dan sudah diverifikasi labelnya.
 * Idempoten: memakai onConflictDoNothing, jadi menjalankan ulang tidak
 * menimpa perubahan yang dibuat lewat CMS.
 */

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL (atau DATABASE_URL_UNPOOLED) belum diisi.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool);

const now = new Date();

const projectRows: NewProject[] = works.map((w, index) => ({
  id: `proj-${w.slug}`,
  slug: w.slug,
  titleEn: w.title.en,
  titleId: w.title.id,
  summaryEn: w.summary.en,
  summaryId: w.summary.id,
  scopeOfWorkEn: w.type.en,
  scopeOfWorkId: w.type.id,
  generalLocation: w.location || null,
  sourcePost: w.sourcePost,
  projectStatus: w.projectStatus ?? null,
  yearCompleted: w.year ? Number.parseInt(w.year, 10) || null : null,
  coverUrl: w.image.src,
  coverRole: w.role === "render" ? "render" : "foto_lapangan",
  coverAltEn: w.image.alt.en,
  coverAltId: w.image.alt.id,
  sortOrder: index + 1,
  contentStatus: "published",
  publishedAt: now,
}));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const serviceRows: NewService[] = mockServices.map((s, index) => ({
  id: `svc-${slugify(s.title.en)}`,
  slug: slugify(s.title.en),
  titleEn: s.title.en,
  titleId: s.title.id,
  descriptionEn: s.description.en,
  descriptionId: s.description.id,
  sortOrder: index + 1,
  contentStatus: "published",
  publishedAt: now,
}));

const stepRows: NewProcessStep[] = mockSteps.map((s, index) => ({
  id: `step-${s.number}`,
  titleEn: s.title.en,
  titleId: s.title.id,
  descriptionEn: s.description.en,
  descriptionId: s.description.id,
  sortOrder: index + 1,
  contentStatus: "published",
  publishedAt: now,
}));

/**
 * Ulasan pratinjau (Tahap 4). `permissionConfirmed` diisi true supaya
 * gerbang publikasi PRD tetap konsisten (kueri publik hanya menampilkan
 * baris ber-izin); status "contoh" disimpan di kolom `source` dan wajib
 * diganti ulasan asli sebelum produksi (kendala A4).
 */
const testimonialRows: NewTestimonial[] = mockTestimonials.map((t, index) => ({
  id: `tst-${String(index + 1).padStart(2, "0")}`,
  clientDisplayName: t.author,
  quoteEn: t.quote.en,
  quoteId: t.quote.id,
  projectId: `proj-${t.projectSlug}`,
  source: t.source,
  permissionConfirmed: true,
  sortOrder: index + 1,
  contentStatus: "published",
  publishedAt: now,
}));

/**
 * Pertanyaan umum resmi (FAQ) yang ditulis dari fakta situs: layanan, alur
 * konsultasi, wilayah, label media, kanal resmi, dan privasi.
 */
const faqRows: NewFaq[] = mockFaqs.map((f, index) => ({
  id: `faq-${String(index + 1).padStart(2, "0")}`,
  questionEn: f.question.en,
  questionId: f.question.id,
  answerEn: f.answer.en,
  answerId: f.answer.id,
  sortOrder: index + 1,
  contentStatus: "published",
  publishedAt: now,
}));

const settingRows: NewSiteSetting[] = [
  {
    id: "set-site-name",
    key: "site_name",
    valueEn: "RR Design & Build",
    valueId: "RR Design & Build",
    group: "umum",
  },
  {
    id: "set-service-area",
    key: "service_area",
    valueEn: "Jabodetabek and surrounding areas",
    valueId: "Jabodetabek dan sekitarnya",
    group: "umum",
  },
  {
    id: "set-public-language",
    key: "public_language",
    valueEn: "en",
    group: "umum",
  },
  {
    id: "set-default-theme",
    key: "default_theme",
    valueEn: "auto",
    group: "tampilan",
  },
  {
    id: "set-whatsapp-number",
    key: "whatsapp_number",
    valueEn: SITE.whatsappNumber,
    group: "kontak",
  },
  {
    id: "set-whatsapp-display",
    key: "whatsapp_display",
    valueEn: SITE.phoneDisplay,
    group: "kontak",
  },
  {
    id: "set-instagram-url",
    key: "instagram_url",
    valueEn: SITE.instagram,
    group: "kontak",
  },
  {
    id: "set-instagram-handle",
    key: "instagram_handle",
    valueEn: SITE.instagramHandle,
    group: "kontak",
  },
  {
    id: "set-wa-message-base",
    key: "wa_message_base",
    valueEn: "Hello RR, I would like to discuss an interior or construction plan.",
    valueId: "Halo RR, saya ingin berdiskusi tentang rencana interior atau konstruksi.",
    group: "kontak",
  },
  {
    id: "set-wa-message-project",
    key: "wa_message_project",
    valueEn:
      "Hello RR, I saw the project “{title}”{details} on your website and would like to discuss a similar one.\nInstagram {post}",
    valueId:
      "Halo RR, saya melihat proyek “{title}”{details} di website dan ingin membahas rencana serupa.\nInstagram {post}",
    group: "kontak",
  },
  {
    id: "set-wa-message-services",
    key: "wa_message_services",
    valueEn:
      "Hello RR, I have read the Services page. I would like to discuss which service fits, and I can start with a photo or rough sizes.",
    valueId:
      "Halo RR, saya membaca halaman Layanan. Saya ingin berdiskusi tentang layanan yang cocok, dan saya bisa mulai dari foto atau ukuran kasar.",
    group: "kontak",
  },
  {
    id: "set-prep-title",
    key: "prep_title",
    valueEn: "Start without final drawings",
    valueId: "Mulai tanpa gambar final",
    group: "umum",
  },
  {
    id: "set-prep-body",
    key: "prep_body",
    valueEn:
      "A photo, a rough size, or a description of the problem is enough. Measurements, budget, and final design can come later, step by step.",
    valueId:
      "Foto, ukuran kasar, atau deskripsi masalahnya sudah cukup. Ukuran, anggaran, dan desain final bisa menyusul, selangkah demi selangkah.",
    group: "umum",
  },
];

await db.insert(projects).values(projectRows).onConflictDoNothing();
await db.insert(services).values(serviceRows).onConflictDoNothing();
await db.insert(processSteps).values(stepRows).onConflictDoNothing();
await db.insert(siteSettings).values(settingRows).onConflictDoNothing();
await db.insert(testimonials).values(testimonialRows).onConflictDoNothing();
await db.insert(faqs).values(faqRows).onConflictDoNothing();

/**
 * Pustaka media galeri + relasinya (PRD §6.4/§6.5).
 * Sumber: pemetaan galeri yang sudah diverifikasi visual
 * (src/lib/sample-gallery.ts, dari arsip publik RR). Berkas siap &
 * disetujui (consent_confirmed) karena memang milik RR dan dipakai
 * di situs publiknya.
 */
const mimeOf = (src: string) => {
  const ext = src.slice(src.lastIndexOf(".")).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webp") return "image/webp";
  if (ext === ".png") return "image/png";
  return "image/jpeg";
};

const mediaRows: NewMediaAsset[] = [];
const projectMediaRows: NewProjectMedia[] = [];
for (const w of works) {
  for (const item of sampleGallery[w.slug] ?? []) {
    const suffix = String(item.order).padStart(2, "0");
    const mediaId = `media-${w.slug}-${suffix}`;
    mediaRows.push({
      id: mediaId,
      mediaType: item.type ?? "foto",
      mediaRole: item.role,
      fileUrl: item.src,
      thumbnailUrl: item.poster ?? null,
      altTextEn: item.alt.en,
      altTextId: item.alt.id,
      credit: "Arsip RR Design & Build",
      consentConfirmed: true,
      mimeType: mimeOf(item.src),
      uploadStatus: "sukses",
    });
    projectMediaRows.push({
      id: `pm-${w.slug}-${suffix}`,
      projectId: `proj-${w.slug}`,
      mediaId,
      section: "galeri",
      sortOrder: item.order,
    });
  }
}

await db.insert(mediaAssets).values(mediaRows).onConflictDoNothing();
await db.insert(projectMedia).values(projectMediaRows).onConflictDoNothing();

/**
 * Isi kolom ringkasan yang masih kosong pada baris lama (mis. database
 * yang sudah pernah di-seed sebelum ringkasan ditambahkan). Hanya
 * menyentuh baris yang belum punya ringkasan, jadi suntingan CMS aman.
 */
for (const w of works) {
  await pool.query(
    "UPDATE projects SET summary_en = $1, summary_id = $2 WHERE slug = $3 AND summary_en IS NULL AND summary_id IS NULL",
    [w.summary.en, w.summary.id, w.slug]
  );
}

/**
 * Backfill provenance & kredit untuk baris lama (database yang di-seed
 * sebelum kolom/atribusi ini ada). Hanya mengisi yang masih kosong.
 */
for (const w of works) {
  if (w.sourcePost) {
    await pool.query(
      "UPDATE projects SET source_post = $1 WHERE slug = $2 AND source_post IS NULL",
      [w.sourcePost, w.slug]
    );
  }
}

/**
 * Normalisasi provenance lama: shortcode yang masih membawa prefiks nomor
 * urut arsip (mis. "089_ABC") tidak valid untuk URL Instagram. Hanya baris
 * yang persis cocok pola 3 digit + garis bawah yang disentuh.
 */
await pool.query(
  "UPDATE projects SET source_post = substring(source_post from position('_' in source_post) + 1) WHERE source_post ~ '^[0-9]{3}_'"
);
await pool.query(
  "UPDATE media_assets SET credit = $1 WHERE credit IS NULL AND id LIKE 'media-%'",
  ["Arsip RR Design & Build"]
);

const count = async (table: string) => {
  const result = await pool.query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM ${table}`
  );
  return result.rows[0]?.n ?? 0;
};

const counts = {
  projects: await count("projects"),
  services: await count("services"),
  processSteps: await count("process_steps"),
  settings: await count("site_settings"),
  media: await count("media_assets"),
  projectMedia: await count("project_media"),
};

await pool.end();
console.log(
  `Seed selesai: ${counts.projects} proyek, ${counts.services} layanan, ` +
    `${counts.processSteps} langkah proses, ${counts.settings} pengaturan, ` +
    `${counts.media} media, ${counts.projectMedia} relasi media.`
);
