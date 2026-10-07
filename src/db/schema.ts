import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Skema aktif: PostgreSQL (Neon). Pengganti skema SQLite (arsip di
 * `drizzle-sqlite/schema.sqlite.ts`). Pemetaan: waktu `timestamptz`,
 * boolean asli, JSON `jsonb`, enum sebagai text + check, unique index
 * tetap sama. Lihat dokumen audit Fase 0 untuk alasan tiap transformasi.
 */

/** Status konten sesuai PRD: publik hanya membaca "published". */
export const contentStatuses = ["draft", "published", "trashed"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

/** Peran akun panel (PRD §6.1); kebijakan persetujuan menyusul (D04). */
export const userRoles = ["admin", "editor", "approver"] as const;
export type UserRole = (typeof userRoles)[number];

/** Entitas yang direvisi (PRD §6.11 content_revisions). */
export const revisionEntityTypes = [
  "project",
  "media",
  "service",
  "page",
  "settings",
] as const;
export type RevisionEntityType = (typeof revisionEntityTypes)[number];

/** Kolom umum koleksi konten: urutan, status, waktu, soft delete. */
function contentColumns() {
  return {
    sortOrder: integer("sort_order").notNull().default(0),
    contentStatus: text("content_status", { enum: contentStatuses })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  };
}

/**
 * Akun tim RR untuk panel admin (PRD §6.1). Kata sandi disimpan sebagai
 * hash scrypt (lihat lib/auth); tidak pernah sebagai teks biasa.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: userRoles }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Sesi login aktif (PRD §6.2). Yang disimpan adalah HASH token (sha256),
 * bukan token mentah — kebocoran basis data tidak memberi sesi hidup.
 */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)]
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

/**
 * Layanan RR (PRD §6 tabel services).
 * Field _id/_en aktif karena bilingual disetujui; draf boleh belum lengkap.
 */
export const services = pgTable(
  "services",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    titleId: text("title_id"),
    titleEn: text("title_en"),
    descriptionId: text("description_id"),
    descriptionEn: text("description_en"),
    ...contentColumns(),
  },
  (table) => [
    check(
      "services_title_present",
      sql`${table.titleId} IS NOT NULL OR ${table.titleEn} IS NOT NULL`
    ),
  ]
);

/** Langkah proses kerja; nomor tampil (/01, /02) diturunkan dari sortOrder. */
export const processSteps = pgTable(
  "process_steps",
  {
    id: text("id").primaryKey(),
    titleId: text("title_id"),
    titleEn: text("title_en"),
    descriptionId: text("description_id"),
    descriptionEn: text("description_en"),
    ...contentColumns(),
  },
  (table) => [
    check(
      "process_steps_title_present",
      sql`${table.titleId} IS NOT NULL OR ${table.titleEn} IS NOT NULL`
    ),
  ]
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ProcessStep = typeof processSteps.$inferSelect;
export type NewProcessStep = typeof processSteps.$inferInsert;

/**
 * Pengaturan situs (PRD §6 tabel site_settings): satu konfigurasi publik.
 * `updated_by` menyimpan id pengguna (FK menyusul bila diperlukan).
 */
export const siteSettings = pgTable(
  "site_settings",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    valueId: text("value_id"),
    valueEn: text("value_en"),
    group: text("group").notNull().default("umum"),
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "site_settings_value_present",
      sql`${table.valueId} IS NOT NULL OR ${table.valueEn} IS NOT NULL`
    ),
  ]
);

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

/** Status proyek yang tampil ke publik (PRD §6). */
export const projectStatuses = ["selesai", "berjalan"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

/** Label jenis media: Render vs Foto Lapangan (arsitektur §9.2). */
export const mediaRoles = ["render", "foto_lapangan"] as const;
export type MediaRole = (typeof mediaRoles)[number];

/** Jenis berkas media (PRD §6 tabel media_assets). */
export const mediaTypes = ["foto", "video"] as const;
export type MediaType = (typeof mediaTypes)[number];

/** Status unggah berkas media (PRD §6). */
export const uploadStatuses = ["sukses", "gagal", "diproses"] as const;
export type UploadStatus = (typeof uploadStatuses)[number];

/**
 * Proyek (PRD §6 tabel projects).
 * Catatan: cover disimpan langsung di sini; relasi galeri ada di
 * media_assets/project_media.
 */
export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    titleId: text("title_id"),
    titleEn: text("title_en"),
    summaryId: text("summary_id"),
    summaryEn: text("summary_en"),
    scopeOfWorkId: text("scope_of_work_id"),
    scopeOfWorkEn: text("scope_of_work_en"),
    roomType: text("room_type"),
    generalLocation: text("general_location"),
    /** Shortcode postingan arsip asal (provenance ke unggahan publik RR). */
    sourcePost: text("source_post"),
    projectStatus: text("project_status", { enum: projectStatuses }),
    yearCompleted: integer("year_completed"),
    coverUrl: text("cover_url"),
    coverRole: text("cover_role", { enum: mediaRoles }),
    coverAltId: text("cover_alt_id"),
    coverAltEn: text("cover_alt_en"),
    ...contentColumns(),
  },
  (table) => [
    check(
      "projects_title_present",
      sql`${table.titleId} IS NOT NULL OR ${table.titleEn} IS NOT NULL`
    ),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

/**
 * Pustaka berkas media (PRD §6 tabel media_assets) dengan label peran
 * (Render / Foto Lapangan) dan status persetujuan (consent_confirmed).
 * Publikasi mengikuti relasi project_media + status proyeknya; berkas
 * tanpa persetujuan tidak boleh tampil.
 */
export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  mediaType: text("media_type", { enum: mediaTypes }).notNull(),
  mediaRole: text("media_role", { enum: mediaRoles }).notNull(),
  fileUrl: text("file_url").notNull(),
  /**
   * Object key di object storage (mis. "uploads/<uuid>.jpg"). Null untuk
   * data pra-R2 (URL lokal `/uploads/...`). URL publik selalu dibentuk dari
   * konfigurasi delivery + key ini (dokumen §8.2.1).
   */
  storageKey: text("storage_key"),
  thumbnailUrl: text("thumbnail_url"),
  // Nama ramah untuk operator (R25b): tampil di pustaka & pemilih media;
  // kosong = jatuh kembali ke nama berkas. Tidak pernah dipakai di situs.
  name: text("name"),
  altTextId: text("alt_text_id"),
  altTextEn: text("alt_text_en"),
  captionId: text("caption_id"),
  captionEn: text("caption_en"),
  credit: text("credit"),
  consentConfirmed: boolean("consent_confirmed").notNull().default(false),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  uploadStatus: text("upload_status", { enum: uploadStatuses })
    .notNull()
    .default("diproses"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

/** Bagian media dalam proyek (PRD §6.5 project_media). */
export const mediaSections = ["sebelum", "sesudah", "galeri"] as const;
export type MediaSection = (typeof mediaSections)[number];

/**
 * Penghubung proyek & media beserta urutan tampil galeri (PRD §6.5).
 * Satu berkas dapat dipakai di proyek berbeda dengan konteksnya masing-masing.
 */
export const projectMedia = pgTable(
  "project_media",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    mediaId: text("media_id")
      .notNull()
      .references(() => mediaAssets.id),
    section: text("section", { enum: mediaSections }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("project_media_project_idx").on(table.projectId, table.sortOrder),
  ]
);

export type ProjectMedia = typeof projectMedia.$inferSelect;
export type NewProjectMedia = typeof projectMedia.$inferInsert;

/**
 * Halaman teks statis (PRD §6.9): Tentang RR & Kebijakan Privasi yang bisa
 * disunting tanpa kode. Isi dwibahasa; publik hanya membaca `published`.
 */
export const staticPages = pgTable(
  "static_pages",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    titleId: text("title_id"),
    titleEn: text("title_en"),
    bodyId: text("body_id"),
    bodyEn: text("body_en"),
    ...contentColumns(),
  },
  (table) => [
    check(
      "static_pages_title_present",
      sql`${table.titleId} IS NOT NULL OR ${table.titleEn} IS NOT NULL`
    ),
  ]
);

export type StaticPage = typeof staticPages.$inferSelect;
export type NewStaticPage = typeof staticPages.$inferInsert;

/**
 * Testimoni resmi (PRD §6.7): hanya tampil bila diizinkan & terverifikasi.
 * `permission_confirmed` wajib true untuk tayang; relasi proyek opsional.
 */
export const testimonials = pgTable(
  "testimonials",
  {
    id: text("id").primaryKey(),
    clientDisplayName: text("client_display_name"),
    quoteId: text("quote_id"),
    quoteEn: text("quote_en"),
    projectId: text("project_id").references(() => projects.id),
    source: text("source"),
    permissionConfirmed: boolean("permission_confirmed")
      .notNull()
      .default(false),
    ...contentColumns(),
  },
  (table) => [
    check(
      "testimonials_quote_present",
      sql`${table.quoteId} IS NOT NULL OR ${table.quoteEn} IS NOT NULL`
    ),
  ]
);

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

/** Pertanyaan umum resmi (PRD §6.8) dengan jawaban yang disetujui RR. */
export const faqs = pgTable(
  "faqs",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id"),
    questionEn: text("question_en"),
    answerId: text("answer_id"),
    answerEn: text("answer_en"),
    ...contentColumns(),
  },
  (table) => [
    check(
      "faqs_question_present",
      sql`${table.questionId} IS NOT NULL OR ${table.questionEn} IS NOT NULL`
    ),
  ]
);

export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;

/**
 * Riwayat revisi konten (PRD §6.11, disarankan) agar publikasi aman dan
 * bisa ditelusuri. Append-only: satu baris = snapshot saat itu.
 * Hanya panel admin yang menulis; bukan koleksi publik.
 */
export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type", { enum: revisionEntityTypes }).notNull(),
    entityId: text("entity_id").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    status: text("status", { enum: contentStatuses }).notNull(),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("content_revisions_entity_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt
    ),
  ]
);

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type NewContentRevision = typeof contentRevisions.$inferInsert;
