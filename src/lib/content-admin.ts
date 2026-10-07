import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { and, asc, desc, eq, isNull, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  contentRevisions,
  faqs,
  mediaAssets,
  projects,
  projectMedia,
  services,
  siteSettings,
  staticPages,
  testimonials,
  type ContentRevision,
  type MediaAsset,
  type Project,
  type Service,
  type SiteSetting,
  type StaticPage,
} from "@/db/schema";
import { slugify } from "@/lib/utils";
import { WORK_CATEGORY_IDS, workCategoryFor } from "@/lib/work-categories";

/**
 * Lapisan tulis konten untuk pengelolaan admin (server-only).
 * CRUD memakai fungsi ini agar validasi, status publikasi, dan jejak
 * revisi konsisten; halaman publik tetap hanya membaca `published`.
 * Tidak diekspos langsung ke HTTP — panel admin (Fase 4) memanggilnya.
 */

export type ServiceInput = {
  titleEn?: string | null;
  titleId?: string | null;
  descriptionEn?: string | null;
  descriptionId?: string | null;
  sortOrder?: number;
};

export type StaticPageInput = {
  titleEn?: string | null;
  titleId?: string | null;
  bodyEn?: string | null;
  bodyId?: string | null;
};

export type ProjectInput = {
  titleEn?: string | null;
  titleId?: string | null;
  summaryEn?: string | null;
  summaryId?: string | null;
  scopeOfWorkEn?: string | null;
  scopeOfWorkId?: string | null;
  roomType?: string | null;
  generalLocation?: string | null;
  projectStatus?: "selesai" | "berjalan" | null;
  yearCompleted?: number | null;
  coverUrl?: string | null;
  coverRole?: "render" | "foto_lapangan" | null;
  coverAltEn?: string | null;
  coverAltId?: string | null;
  sortOrder?: number;
};

/** Teks kosong/spasi diperlakukan belum diisi; baris baru dinormalkan LF. */
const clean = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? "").replace(/\r\n/g, "\n").trim();
  return trimmed.length > 0 ? trimmed : null;
};

/** Semua layanan untuk pengelolaan (semua status, kecuali yang terhapus). */
export async function listServicesForAdmin(): Promise<Service[]> {
  return db
    .select()
    .from(services)
    .where(isNull(services.deletedAt))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));
}

export async function getServiceById(id: string): Promise<Service | null> {
  const rows = await db
    .select()
    .from(services)
    .where(and(eq(services.id, id), isNull(services.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/** Slug unik dari judul; menambah akhiran angka bila sudah dipakai. */
async function uniqueSlug(base: string): Promise<string> {
  const root = base || "layanan";
  let candidate = root;
  for (let n = 2; ; n += 1) {
    const taken = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, candidate))
      .limit(1);
    if (taken.length === 0) return candidate;
    candidate = `${root}-${n}`;
  }
}

/** Tambah layanan baru sebagai draf (judul minimal satu bahasa). */
export async function createService(input: ServiceInput): Promise<Service> {
  const titleEn = clean(input.titleEn);
  const titleId = clean(input.titleId);
  if (!titleEn && !titleId) {
    throw new Error("Layanan butuh judul minimal satu bahasa (EN/ID).");
  }

  const slug = await uniqueSlug(slugify(titleEn ?? titleId ?? ""));
  const maxRow = await db
    .select({ max: sql<number>`coalesce(max(${services.sortOrder}), 0)` })
    .from(services);

  const [row] = await db
    .insert(services)
    .values({
      id: `svc-${slug}`,
      slug,
      titleEn,
      titleId,
      descriptionEn: clean(input.descriptionEn),
      descriptionId: clean(input.descriptionId),
      sortOrder: input.sortOrder ?? (maxRow[0]?.max ?? 0) + 1,
      contentStatus: "draft",
    })
    .returning();
  return row;
}

/** Ubah isi layanan; judul minimal satu bahasa harus tetap ada. */
export async function updateService(
  id: string,
  input: ServiceInput
): Promise<Service> {
  const existing = await getServiceById(id);
  if (!existing) throw new Error("Layanan tidak ditemukan.");

  const titleEn =
    input.titleEn === undefined ? existing.titleEn : clean(input.titleEn);
  const titleId =
    input.titleId === undefined ? existing.titleId : clean(input.titleId);
  if (!titleEn && !titleId) {
    throw new Error("Judul minimal satu bahasa (EN/ID) harus tetap ada.");
  }

  const [row] = await db
    .update(services)
    .set({
      titleEn,
      titleId,
      descriptionEn:
        input.descriptionEn === undefined
          ? existing.descriptionEn
          : clean(input.descriptionEn),
      descriptionId:
        input.descriptionId === undefined
          ? existing.descriptionId
          : clean(input.descriptionId),
      sortOrder: input.sortOrder ?? existing.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id))
    .returning();
  return row;
}

/**
 * Terbitkan layanan: wajib punya deskripsi (minimal satu bahasa) agar
 * daftar publik tidak berisi kartu kosong; snapshot revisi dicatat.
 */
export async function publishService(id: string): Promise<Service> {
  const existing = await getServiceById(id);
  if (!existing) throw new Error("Layanan tidak ditemukan.");
  if (existing.contentStatus === "trashed") {
    throw new Error("Pulihkan dulu dari Trash sebelum menerbitkan.");
  }
  if (!existing.descriptionEn && !existing.descriptionId) {
    throw new Error(
      "Sebelum terbit, deskripsi minimal satu bahasa perlu diisi."
    );
  }

  const [row] = await db
    .update(services)
    .set({
      contentStatus: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(services.id, id))
    .returning();
  await recordRevision("service", row.id, row, "published");
  return row;
}

/** Pindahkan layanan ke Trash (pulihkan lewat `restoreService`). */
export async function trashService(id: string): Promise<Service> {
  const existing = await getServiceById(id);
  if (!existing) throw new Error("Layanan tidak ditemukan.");
  if (existing.contentStatus === "trashed") {
    throw new Error("Layanan sudah ada di Trash.");
  }

  const [row] = await db
    .update(services)
    .set({ contentStatus: "trashed", updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();
  await recordRevision("service", row.id, row, "trashed");
  return row;
}

/** Pulihkan layanan dari Trash sebagai draf (terbit eksplisit menyusul). */
export async function restoreService(id: string): Promise<Service> {
  const existing = await getServiceById(id);
  if (!existing) throw new Error("Layanan tidak ditemukan.");
  if (existing.contentStatus !== "trashed") {
    throw new Error("Hanya layanan di Trash yang bisa dipulihkan.");
  }

  const [row] = await db
    .update(services)
    .set({ contentStatus: "draft", updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();
  return row;
}

/**
 * Jejak revisi publikasi (PRD §6.11): snapshot saat status publik berubah.
 * Snapshot disimpan apa adanya (baris entitas saat itu) sebagai JSON.
 */
async function recordRevision(
  entityType: "project" | "service" | "page" | "settings",
  entityId: string,
  snapshot: unknown,
  status: "published" | "trashed"
): Promise<void> {
  await db.insert(contentRevisions).values({
    id: `rev-${randomUUID()}`,
    entityType,
    entityId,
    snapshot,
    status,
  });
}

/**
 * Riwayat revisi sebuah entitas (terbaru dulu) untuk penelusuran admin:
 * kapan diterbitkan/ditarik dan isi snapshot saat itu.
 */
export async function listContentRevisions(
  entityType: "project" | "service" | "page" | "settings",
  entityId: string
): Promise<ContentRevision[]> {
  return db
    .select()
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.entityType, entityType),
        eq(contentRevisions.entityId, entityId)
      )
    )
    .orderBy(desc(contentRevisions.createdAt), desc(contentRevisions.id));
}

/** Semua halaman teks untuk pengelolaan (semua status, kecuali terhapus). */
export async function listStaticPagesForAdmin(): Promise<StaticPage[]> {
  return db
    .select()
    .from(staticPages)
    .where(isNull(staticPages.deletedAt))
    .orderBy(asc(staticPages.sortOrder), asc(staticPages.createdAt));
}

export async function getStaticPageById(id: string): Promise<StaticPage | null> {
  const rows = await db
    .select()
    .from(staticPages)
    .where(and(eq(staticPages.id, id), isNull(staticPages.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/** Tambah halaman baru sebagai draf; slug wajib & unik (stabil untuk URL). */
export async function createStaticPage(
  slugInput: string,
  input: StaticPageInput
): Promise<StaticPage> {
  const titleEn = clean(input.titleEn);
  const titleId = clean(input.titleId);
  if (!titleEn && !titleId) {
    throw new Error("Halaman butuh judul minimal satu bahasa (EN/ID).");
  }

  const slug = slugify(slugInput);
  if (!slug) throw new Error("Slug halaman wajib diisi.");
  const taken = await db
    .select({ id: staticPages.id })
    .from(staticPages)
    .where(eq(staticPages.slug, slug))
    .limit(1);
  if (taken.length > 0) {
    throw new Error(`Slug "${slug}" sudah dipakai halaman lain.`);
  }

  const [row] = await db
    .insert(staticPages)
    .values({
      id: `page-${slug}`,
      slug,
      titleEn,
      titleId,
      bodyEn: clean(input.bodyEn),
      bodyId: clean(input.bodyId),
      contentStatus: "draft",
    })
    .returning();
  return row;
}

/** Ubah isi halaman; judul minimal satu bahasa harus tetap ada; slug tetap. */
export async function updateStaticPage(
  id: string,
  input: StaticPageInput
): Promise<StaticPage> {
  const existing = await getStaticPageById(id);
  if (!existing) throw new Error("Halaman tidak ditemukan.");

  const titleEn =
    input.titleEn === undefined ? existing.titleEn : clean(input.titleEn);
  const titleId =
    input.titleId === undefined ? existing.titleId : clean(input.titleId);
  if (!titleEn && !titleId) {
    throw new Error("Judul minimal satu bahasa (EN/ID) harus tetap ada.");
  }

  const [row] = await db
    .update(staticPages)
    .set({
      titleEn,
      titleId,
      bodyEn:
        input.bodyEn === undefined ? existing.bodyEn : clean(input.bodyEn),
      bodyId: input.bodyId === undefined ? existing.bodyId : clean(input.bodyId),
      updatedAt: new Date(),
    })
    .where(eq(staticPages.id, id))
    .returning();
  return row;
}

/** Terbitkan halaman: wajib punya isi (minimal satu bahasa). */
export async function publishStaticPage(id: string): Promise<StaticPage> {
  const existing = await getStaticPageById(id);
  if (!existing) throw new Error("Halaman tidak ditemukan.");
  if (existing.contentStatus === "trashed") {
    throw new Error("Pulihkan dulu dari Trash sebelum menerbitkan.");
  }
  if (!existing.bodyEn && !existing.bodyId) {
    throw new Error(
      "Sebelum terbit, isi halaman minimal satu bahasa perlu diisi."
    );
  }

  const [row] = await db
    .update(staticPages)
    .set({
      contentStatus: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(staticPages.id, id))
    .returning();
  await recordRevision("page", row.id, row, "published");
  return row;
}

/** Pindahkan halaman ke Trash (pulihkan lewat `restoreStaticPage`). */
export async function trashStaticPage(id: string): Promise<StaticPage> {
  const existing = await getStaticPageById(id);
  if (!existing) throw new Error("Halaman tidak ditemukan.");
  if (existing.contentStatus === "trashed") {
    throw new Error("Halaman sudah ada di Trash.");
  }

  const [row] = await db
    .update(staticPages)
    .set({ contentStatus: "trashed", updatedAt: new Date() })
    .where(eq(staticPages.id, id))
    .returning();
  await recordRevision("page", row.id, row, "trashed");
  return row;
}

/** Pulihkan halaman dari Trash sebagai draf (terbit eksplisit menyusul). */
export async function restoreStaticPage(id: string): Promise<StaticPage> {
  const existing = await getStaticPageById(id);
  if (!existing) throw new Error("Halaman tidak ditemukan.");
  if (existing.contentStatus !== "trashed") {
    throw new Error("Hanya halaman di Trash yang bisa dipulihkan.");
  }

  const [row] = await db
    .update(staticPages)
    .set({ contentStatus: "draft", updatedAt: new Date() })
    .where(eq(staticPages.id, id))
    .returning();
  return row;
}

const PROJECT_STATUSES = ["selesai", "berjalan"] as const;
const COVER_ROLES = ["render", "foto_lapangan"] as const;

function validYear(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isInteger(value) || value < 1900 || value > 2100) {
    throw new Error("Tahun harus bilangan bulat 1900–2100.");
  }
  return value;
}

/** Semua proyek untuk pengelolaan (semua status, kecuali terhapus). */
export async function listProjectsForAdmin(): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(asc(projects.sortOrder), asc(projects.createdAt));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/** Tambah proyek baru sebagai draf; slug wajib & unik (stabil untuk URL). */
export async function createProject(
  slugInput: string,
  input: ProjectInput
): Promise<Project> {
  const titleEn = clean(input.titleEn);
  const titleId = clean(input.titleId);
  if (!titleEn && !titleId) {
    throw new Error("Proyek butuh judul minimal satu bahasa (EN/ID).");
  }
  const slug = slugify(slugInput);
  if (!slug) throw new Error("Slug proyek wajib diisi.");
  const taken = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  if (taken.length > 0) {
    throw new Error(`Slug "${slug}" sudah dipakai proyek lain.`);
  }
  if (
    input.projectStatus &&
    !PROJECT_STATUSES.includes(input.projectStatus)
  ) {
    throw new Error("Status proyek harus selesai atau berjalan.");
  }
  if (input.coverRole && !COVER_ROLES.includes(input.coverRole)) {
    throw new Error("Peran cover harus render atau foto lapangan.");
  }
  const year = validYear(input.yearCompleted);

  const maxRow = await db
    .select({ max: sql<number>`coalesce(max(${projects.sortOrder}), 0)` })
    .from(projects);
  const [row] = await db
    .insert(projects)
    .values({
      id: `proj-${slug}`,
      slug,
      titleEn,
      titleId,
      summaryEn: clean(input.summaryEn),
      summaryId: clean(input.summaryId),
      scopeOfWorkEn: clean(input.scopeOfWorkEn),
      scopeOfWorkId: clean(input.scopeOfWorkId),
      roomType: clean(input.roomType),
      generalLocation: clean(input.generalLocation),
      projectStatus: input.projectStatus ?? null,
      yearCompleted: year,
      coverUrl: clean(input.coverUrl),
      coverRole: input.coverRole ?? null,
      coverAltEn: clean(input.coverAltEn),
      coverAltId: clean(input.coverAltId),
      sortOrder: input.sortOrder ?? (maxRow[0]?.max ?? 0) + 1,
      contentStatus: "draft",
    })
    .returning();
  return row;
}

/** Ubah proyek; judul minimal satu bahasa harus tetap ada; slug tetap. */
export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) throw new Error("Proyek tidak ditemukan.");

  const titleEn =
    input.titleEn === undefined ? existing.titleEn : clean(input.titleEn);
  const titleId =
    input.titleId === undefined ? existing.titleId : clean(input.titleId);
  if (!titleEn && !titleId) {
    throw new Error("Judul minimal satu bahasa (EN/ID) harus tetap ada.");
  }
  if (
    input.projectStatus !== undefined &&
    input.projectStatus !== null &&
    !PROJECT_STATUSES.includes(input.projectStatus)
  ) {
    throw new Error("Status proyek harus selesai atau berjalan.");
  }
  if (
    input.coverRole !== undefined &&
    input.coverRole !== null &&
    !COVER_ROLES.includes(input.coverRole)
  ) {
    throw new Error("Peran cover harus render atau foto lapangan.");
  }
  const year =
    input.yearCompleted === undefined
      ? existing.yearCompleted
      : validYear(input.yearCompleted);

  const [row] = await db
    .update(projects)
    .set({
      titleEn,
      titleId,
      summaryEn:
        input.summaryEn === undefined ? existing.summaryEn : clean(input.summaryEn),
      summaryId:
        input.summaryId === undefined ? existing.summaryId : clean(input.summaryId),
      scopeOfWorkEn:
        input.scopeOfWorkEn === undefined
          ? existing.scopeOfWorkEn
          : clean(input.scopeOfWorkEn),
      scopeOfWorkId:
        input.scopeOfWorkId === undefined
          ? existing.scopeOfWorkId
          : clean(input.scopeOfWorkId),
      roomType:
        input.roomType === undefined ? existing.roomType : clean(input.roomType),
      generalLocation:
        input.generalLocation === undefined
          ? existing.generalLocation
          : clean(input.generalLocation),
      projectStatus:
        input.projectStatus === undefined
          ? existing.projectStatus
          : input.projectStatus,
      yearCompleted: year,
      coverUrl:
        input.coverUrl === undefined ? existing.coverUrl : clean(input.coverUrl),
      coverRole:
        input.coverRole === undefined ? existing.coverRole : input.coverRole,
      coverAltEn:
        input.coverAltEn === undefined
          ? existing.coverAltEn
          : clean(input.coverAltEn),
      coverAltId:
        input.coverAltId === undefined
          ? existing.coverAltId
          : clean(input.coverAltId),
      sortOrder: input.sortOrder ?? existing.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

/** Terbitkan proyek: wajib punya ringkasan (minimal satu bahasa). */
export async function publishProject(id: string): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) throw new Error("Proyek tidak ditemukan.");
  if (existing.contentStatus === "trashed") {
    throw new Error("Pulihkan dulu dari Trash sebelum menerbitkan.");
  }
  if (!existing.summaryEn && !existing.summaryId) {
    throw new Error(
      "Sebelum terbit, ringkasan minimal satu bahasa perlu diisi."
    );
  }

  const [row] = await db
    .update(projects)
    .set({
      contentStatus: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();
  await recordRevision("project", row.id, row, "published");
  return row;
}

/** Pindahkan proyek ke Trash (pulihkan lewat `restoreProject`). */
export async function trashProject(id: string): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) throw new Error("Proyek tidak ditemukan.");
  if (existing.contentStatus === "trashed") {
    throw new Error("Proyek sudah ada di Trash.");
  }

  const [row] = await db
    .update(projects)
    .set({ contentStatus: "trashed", updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  await recordRevision("project", row.id, row, "trashed");
  return row;
}

/** Pulihkan proyek dari Trash sebagai draf (terbit eksplisit menyusul). */
export async function restoreProject(id: string): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) throw new Error("Proyek tidak ditemukan.");
  if (existing.contentStatus !== "trashed") {
    throw new Error("Hanya proyek di Trash yang bisa dipulihkan.");
  }

  const [row] = await db
    .update(projects)
    .set({ contentStatus: "draft", updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

export type SiteSettingInput = {
  valueEn?: string | null;
  valueId?: string | null;
};

/** Semua pengaturan situs untuk pengelolaan (terurut grup lalu kunci). */
export async function listSettingsForAdmin(): Promise<SiteSetting[]> {
  return db
    .select()
    .from(siteSettings)
    .orderBy(asc(siteSettings.group), asc(siteSettings.key));
}

/**
 * Ubah nilai pengaturan (kunci harus sudah ada; minimal satu bahasa terisi).
 * Snapshot revisi dicatat agar perubahan teks situs bisa ditelusuri.
 */
export async function updateSiteSetting(
  key: string,
  input: SiteSettingInput
): Promise<SiteSetting> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  const existing = rows[0];
  if (!existing) {
    throw new Error(`Pengaturan "${key}" tidak dikenal.`);
  }

  const valueEn =
    input.valueEn === undefined ? existing.valueEn : clean(input.valueEn);
  const valueId =
    input.valueId === undefined ? existing.valueId : clean(input.valueId);
  if (!valueEn && !valueId) {
    throw new Error("Nilai pengaturan tidak boleh kosong seluruhnya.");
  }

  const [row] = await db
    .update(siteSettings)
    .set({ valueEn, valueId, updatedAt: new Date() })
    .where(eq(siteSettings.key, key))
    .returning();
  await recordRevision("settings", row.id, row, "published");
  return row;
}

/** Jenis entitas yang bisa berada di Trash. */
export type TrashEntityType = "project" | "service" | "page" | "media";

export type TrashItem = {
  type: TrashEntityType;
  id: string;
  label: string;
  /** Perkiraan waktu dipindahkan (updatedAt saat status berubah). */
  trashedAt: Date;
  dependencies: number;
};

export type DependencyReport = { count: number; notes: string[] };

/**
 * Dependensi yang harus diselesaikan sebelum hapus permanen:
 * - proyek: relasi galeri (project_media) dan testimoni yang menautkannya;
 * - media: relasi galeri pada proyek mana pun;
 * - layanan/halaman: belum ada relasi di skema saat ini.
 */
export async function getTrashDependencies(
  type: TrashEntityType,
  id: string
): Promise<DependencyReport> {
  const notes: string[] = [];
  let count = 0;

  if (type === "project") {
    const mediaLinks = await db
      .select({ id: projectMedia.id })
      .from(projectMedia)
      .where(eq(projectMedia.projectId, id));
    if (mediaLinks.length > 0) {
      count += mediaLinks.length;
      notes.push(`${mediaLinks.length} media terhubung ke proyek ini.`);
    }
    const quotes = await db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(eq(testimonials.projectId, id));
    if (quotes.length > 0) {
      count += quotes.length;
      notes.push(`${quotes.length} testimoni menautkan proyek ini.`);
    }
  } else if (type === "media") {
    const links = await db
      .select({
        titleEn: projects.titleEn,
        titleId: projects.titleId,
        slug: projects.slug,
      })
      .from(projectMedia)
      .innerJoin(projects, eq(projectMedia.projectId, projects.id))
      .where(eq(projectMedia.mediaId, id));
    if (links.length > 0) {
      count += links.length;
      const titles = [
        ...new Set(links.map((l) => l.titleEn ?? l.titleId ?? l.slug)),
      ];
      notes.push(
        `Dipakai ${links.length} relasi galeri: ${titles.slice(0, 3).join(", ")}${titles.length > 3 ? ", …" : ""}.`
      );
    }
  }

  return { count, notes };
}

/** Isi Trash lintas entitas, terbaru dulu, dengan jumlah dependensi. */
export async function listTrashForAdmin(): Promise<TrashItem[]> {
  const items: TrashItem[] = [];

  const trashedProjects = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.contentStatus, "trashed"), isNull(projects.deletedAt))
    );
  for (const row of trashedProjects) {
    const deps = await getTrashDependencies("project", row.id);
    items.push({
      type: "project",
      id: row.id,
      label: row.titleEn ?? row.titleId ?? row.slug,
      trashedAt: row.updatedAt,
      dependencies: deps.count,
    });
  }

  const trashedServices = await db
    .select()
    .from(services)
    .where(
      and(eq(services.contentStatus, "trashed"), isNull(services.deletedAt))
    );
  for (const row of trashedServices) {
    items.push({
      type: "service",
      id: row.id,
      label: row.titleEn ?? row.titleId ?? row.slug,
      trashedAt: row.updatedAt,
      dependencies: 0,
    });
  }

  const trashedPages = await db
    .select()
    .from(staticPages)
    .where(
      and(eq(staticPages.contentStatus, "trashed"), isNull(staticPages.deletedAt))
    );
  for (const row of trashedPages) {
    items.push({
      type: "page",
      id: row.id,
      label: row.titleEn ?? row.titleId ?? row.slug,
      trashedAt: row.updatedAt,
      dependencies: 0,
    });
  }

  const trashedMedia = await db
    .select()
    .from(mediaAssets)
    .where(isNotNull(mediaAssets.deletedAt));
  for (const row of trashedMedia) {
    const deps = await getTrashDependencies("media", row.id);
    items.push({
      type: "media",
      id: row.id,
      label: row.fileUrl.split("/").pop() ?? row.fileUrl,
      trashedAt: row.deletedAt ?? row.updatedAt,
      dependencies: deps.count,
    });
  }

  return items.sort((a, b) => b.trashedAt.getTime() - a.trashedAt.getTime());
}

/** Pindahkan media ke Trash (soft delete; berkas tidak dihapus). */
export async function trashMediaAsset(id: string): Promise<void> {
  const result = await db
    .update(mediaAssets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(mediaAssets.id, id), isNull(mediaAssets.deletedAt)));
  if ((result.rowCount ?? 0) === 0) {
    throw new Error("Media tidak ditemukan atau sudah di Trash.");
  }
}

/** Pulihkan media dari Trash. */
export async function restoreMediaAsset(id: string): Promise<void> {
  const result = await db
    .update(mediaAssets)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(mediaAssets.id, id), isNotNull(mediaAssets.deletedAt)));
  if ((result.rowCount ?? 0) === 0) {
    throw new Error("Media tidak ditemukan di Trash.");
  }
}

/**
 * Hapus permanen dari Trash — ditahan bila masih ada dependensi.
 * Berkas hanya dihapus bila berasal dari folder unggahan runtime
 * (/uploads/...); aset repositori tidak pernah disentuh.
 */
export async function deleteFromTrash(
  type: TrashEntityType,
  id: string
): Promise<void> {
  const deps = await getTrashDependencies(type, id);
  if (deps.count > 0) {
    throw new Error(
      `Masih ada dependensi: ${deps.notes.join(" ")} Selesaikan dulu sebelum hapus permanen.`
    );
  }

  if (type === "project") {
    const existing = await getProjectById(id);
    if (!existing) throw new Error("Proyek tidak ditemukan.");
    if (existing.contentStatus !== "trashed") {
      throw new Error("Hanya item di Trash yang bisa dihapus permanen.");
    }
    await db.delete(projects).where(eq(projects.id, id));
    return;
  }

  if (type === "service") {
    const existing = await getServiceById(id);
    if (!existing) throw new Error("Layanan tidak ditemukan.");
    if (existing.contentStatus !== "trashed") {
      throw new Error("Hanya item di Trash yang bisa dihapus permanen.");
    }
    await db.delete(services).where(eq(services.id, id));
    return;
  }

  if (type === "page") {
    const existing = await getStaticPageById(id);
    if (!existing) throw new Error("Halaman tidak ditemukan.");
    if (existing.contentStatus !== "trashed") {
      throw new Error("Hanya item di Trash yang bisa dihapus permanen.");
    }
    await db.delete(staticPages).where(eq(staticPages.id, id));
    return;
  }

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, id), isNotNull(mediaAssets.deletedAt)))
    .limit(1);
  const media = rows[0];
  if (!media) throw new Error("Media tidak ditemukan di Trash.");
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  if (media.fileUrl.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", media.fileUrl)).catch(
      () => {}
    );
  }
}

/* ------------------------------------------------------------------ */
/* Ringkasan dasbor & daftar terkini (B1)                             */
/* ------------------------------------------------------------------ */

export type ContentStatusCounts = {
  published: number;
  draft: number;
  trashed: number;
};

export type AdminStats = {
  projects: ContentStatusCounts;
  services: ContentStatusCounts;
  pages: ContentStatusCounts;
  /** Media dengan izin tayang dan tidak di Trash. */
  mediaReady: number;
};

function intoCounts(rows: { status: string | null; n: number }[]): ContentStatusCounts {
  const counts: ContentStatusCounts = { published: 0, draft: 0, trashed: 0 };
  for (const row of rows) {
    if (row.status === "published") counts.published = row.n;
    else if (row.status === "draft") counts.draft = row.n;
    else if (row.status === "trashed") counts.trashed = row.n;
  }
  return counts;
}

/** Angka dasbor: jumlah per status konten + media siap tayang. */
export async function getAdminStats(): Promise<AdminStats> {
  const [projectRows, serviceRows, pageRows, mediaRows] = await Promise.all([
    db
      .select({ status: projects.contentStatus, n: sql<number>`count(*)` })
      .from(projects)
      .where(isNull(projects.deletedAt))
      .groupBy(projects.contentStatus),
    db
      .select({ status: services.contentStatus, n: sql<number>`count(*)` })
      .from(services)
      .where(isNull(services.deletedAt))
      .groupBy(services.contentStatus),
    db
      .select({ status: staticPages.contentStatus, n: sql<number>`count(*)` })
      .from(staticPages)
      .where(isNull(staticPages.deletedAt))
      .groupBy(staticPages.contentStatus),
    db
      .select({ n: sql<number>`count(*)` })
      .from(mediaAssets)
      .where(
        and(eq(mediaAssets.consentConfirmed, true), isNull(mediaAssets.deletedAt))
      ),
  ]);

  return {
    projects: intoCounts(projectRows),
    services: intoCounts(serviceRows),
    pages: intoCounts(pageRows),
    mediaReady: mediaRows[0]?.n ?? 0,
  };
}

/**
 * Angka lencana sidebar panel (R6): proyek aktif (terbit + draf), total
 * media, dan isi Trash — tiga angka yang paling sering dicek pengelola.
 */
export async function getAdminBadgeCounts(): Promise<{
  projects: number;
  media: number;
  trash: number;
}> {
  const [stats, mediaRows, trashRows] = await Promise.all([
    getAdminStats(),
    db
      .select({ n: sql<number>`count(*)` })
      .from(mediaAssets)
      .where(isNull(mediaAssets.deletedAt)),
    listTrashForAdmin(),
  ]);
  return {
    projects: stats.projects.published + stats.projects.draft,
    media: mediaRows[0]?.n ?? 0,
    trash: trashRows.length,
  };
}

export type AdminOverview = {
  /** Jumlah proyek per tahun arsip (hanya tahun yang terisi). */
  projectsByYear: { label: string; value: number }[];
  /** Jumlah proyek per kategori kerja (id kategori; label di lapisan UI). */
  projectsByCategory: { id: string; value: number }[];
  mediaTotal: number;
  mediaNeedsConsent: number;
  mediaVideos: number;
  faqsPublished: number;
  testimonialsPublished: number;
  berjalan: number;
  selesai: number;
  completeness: { ready: number; total: number };
};

/**
 * Ringkasan konten untuk dasbor panel (R6) — seluruh angka dihitung dari
 * basis data; tidak ada metrik karangan (prinsip PRD). "Kelengkapan"
 * berarti proyek terbit yang sudah punya foto utama dan ringkasan.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const [
    projectRows,
    mediaRows,
    needsRows,
    videoRows,
    faqRows,
    testimonialRows,
  ] = await Promise.all([
    db
      .select({
        slug: projects.slug,
        scopeEn: projects.scopeOfWorkEn,
        status: projects.contentStatus,
        projectStatus: projects.projectStatus,
        year: projects.yearCompleted,
        coverUrl: projects.coverUrl,
        summaryEn: projects.summaryEn,
        summaryId: projects.summaryId,
      })
      .from(projects)
      .where(and(isNull(projects.deletedAt), isNotNull(projects.contentStatus))),
    db
      .select({ n: sql<number>`count(*)` })
      .from(mediaAssets)
      .where(isNull(mediaAssets.deletedAt)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(mediaAssets)
      .where(
        and(isNull(mediaAssets.deletedAt), eq(mediaAssets.consentConfirmed, false))
      ),
    db
      .select({ n: sql<number>`count(*)` })
      .from(mediaAssets)
      .where(and(isNull(mediaAssets.deletedAt), eq(mediaAssets.mediaType, "video"))),
    db
      .select({ n: sql<number>`count(*)` })
      .from(faqs)
      .where(and(isNull(faqs.deletedAt), eq(faqs.contentStatus, "published"))),
    db
      .select({ n: sql<number>`count(*)` })
      .from(testimonials)
      .where(
        and(
          isNull(testimonials.deletedAt),
          eq(testimonials.contentStatus, "published"),
          eq(testimonials.permissionConfirmed, true)
        )
      ),
  ]);

  const active = projectRows.filter((p) => p.status !== "trashed");
  const published = active.filter((p) => p.status === "published");

  const yearMap = new Map<number, number>();
  for (const p of active) {
    if (p.year) yearMap.set(p.year, (yearMap.get(p.year) ?? 0) + 1);
  }

  const categoryMap = new Map<string, number>();
  for (const p of active) {
    const id = workCategoryFor(p.slug, p.scopeEn ?? "");
    categoryMap.set(id, (categoryMap.get(id) ?? 0) + 1);
  }

  const ready = published.filter(
    (p) => !!p.coverUrl && !!(p.summaryEn || p.summaryId)
  ).length;

  return {
    projectsByYear: [...yearMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([year, value]) => ({ label: String(year), value })),
    projectsByCategory: WORK_CATEGORY_IDS.map((id) => ({
      id,
      value: categoryMap.get(id) ?? 0,
    })),
    mediaTotal: mediaRows[0]?.n ?? 0,
    mediaNeedsConsent: needsRows[0]?.n ?? 0,
    mediaVideos: videoRows[0]?.n ?? 0,
    faqsPublished: faqRows[0]?.n ?? 0,
    testimonialsPublished: testimonialRows[0]?.n ?? 0,
    berjalan: published.filter((p) => p.projectStatus === "berjalan").length,
    selesai: published.filter((p) => p.projectStatus === "selesai").length,
    completeness: { ready, total: published.length },
  };
}

export type RecentItem = {
  type: "project" | "service" | "page";
  id: string;
  label: string;
  status: "draft" | "published" | "trashed";
  updatedAt: Date;
};

/** Item konten terbaru (proyek/layanan/halaman) untuk dasbor. */
export async function listRecentlyUpdated(limit = 8): Promise<RecentItem[]> {
  const [projectRows, serviceRows, pageRows] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(isNull(projects.deletedAt))
      .orderBy(desc(projects.updatedAt))
      .limit(limit),
    db
      .select()
      .from(services)
      .where(isNull(services.deletedAt))
      .orderBy(desc(services.updatedAt))
      .limit(limit),
    db
      .select()
      .from(staticPages)
      .where(isNull(staticPages.deletedAt))
      .orderBy(desc(staticPages.updatedAt))
      .limit(limit),
  ]);

  const items: RecentItem[] = [
    ...projectRows.map((row) => ({
      type: "project" as const,
      id: row.id,
      label: row.titleEn ?? row.titleId ?? row.slug,
      status: row.contentStatus,
      updatedAt: row.updatedAt,
    })),
    ...serviceRows.map((row) => ({
      type: "service" as const,
      id: row.id,
      label: row.titleEn ?? row.titleId ?? row.slug,
      status: row.contentStatus,
      updatedAt: row.updatedAt,
    })),
    ...pageRows.map((row) => ({
      type: "page" as const,
      id: row.id,
      label: row.titleEn ?? row.titleId ?? row.slug,
      status: row.contentStatus,
      updatedAt: row.updatedAt,
    })),
  ];

  return items
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

/** Tarik proyek terbit kembali menjadi draf (riwayat revisi tetap utuh). */
export async function unpublishProject(id: string): Promise<Project> {
  const existing = await getProjectById(id);
  if (!existing) throw new Error("Proyek tidak ditemukan.");
  if (existing.contentStatus !== "published") {
    throw new Error("Hanya proyek terbit yang bisa ditarik kembali ke draf.");
  }

  const [row] = await db
    .update(projects)
    .set({ contentStatus: "draft", updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

/* ------------------------------------------------------------------ */
/* Pustaka media (B1-2)                                               */
/* ------------------------------------------------------------------ */

export type MediaInput = {
  /** Nama ramah untuk operator (R25b); null mengosongkan = pakai nama berkas. */
  name?: string | null;
  mediaRole?: "render" | "foto_lapangan";
  altTextEn?: string | null;
  altTextId?: string | null;
  captionEn?: string | null;
  captionId?: string | null;
  credit?: string | null;
  consentConfirmed?: boolean;
};

/** Semua media aktif untuk pengelolaan (yang di Trash tampil di halaman Trash). */
export async function listMediaForAdmin(): Promise<MediaAsset[]> {
  return db
    .select()
    .from(mediaAssets)
    .where(isNull(mediaAssets.deletedAt))
    .orderBy(desc(mediaAssets.createdAt), desc(mediaAssets.id));
}

export async function getMediaAssetById(
  id: string
): Promise<MediaAsset | null> {
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, id), isNull(mediaAssets.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Ubah metadata media: peran (render/foto lapangan), teks alternatif, caption,
 * kredit, dan izin tayang. Nilai undefined = biarkan; string kosong = kosongkan.
 */
export async function updateMediaAsset(
  id: string,
  input: MediaInput
): Promise<MediaAsset> {
  const existing = await getMediaAssetById(id);
  if (!existing) throw new Error("Media tidak ditemukan.");

  if (
    input.mediaRole !== undefined &&
    input.mediaRole !== "render" &&
    input.mediaRole !== "foto_lapangan"
  ) {
    throw new Error("Peran media harus render atau foto lapangan.");
  }

  const [row] = await db
    .update(mediaAssets)
    .set({
      name: input.name === undefined ? existing.name : clean(input.name),
      mediaRole: input.mediaRole ?? existing.mediaRole,
      altTextEn:
        input.altTextEn === undefined
          ? existing.altTextEn
          : clean(input.altTextEn),
      altTextId:
        input.altTextId === undefined
          ? existing.altTextId
          : clean(input.altTextId),
      captionEn:
        input.captionEn === undefined
          ? existing.captionEn
          : clean(input.captionEn),
      captionId:
        input.captionId === undefined
          ? existing.captionId
          : clean(input.captionId),
      credit:
        input.credit === undefined ? existing.credit : clean(input.credit),
      consentConfirmed: input.consentConfirmed ?? existing.consentConfirmed,
      updatedAt: new Date(),
    })
    .where(eq(mediaAssets.id, id))
    .returning();
  return row;
}

/* ------------------------------------------------------------------ */
/* Simpan-pulih status tambahan (B1-2b)                               */
/* ------------------------------------------------------------------ */

/** Tarik layanan terbit kembali menjadi draf (riwayat revisi tetap utuh). */
export async function unpublishService(id: string): Promise<Service> {
  const existing = await getServiceById(id);
  if (!existing) throw new Error("Layanan tidak ditemukan.");
  if (existing.contentStatus !== "published") {
    throw new Error("Hanya layanan terbit yang bisa ditarik kembali ke draf.");
  }

  const [row] = await db
    .update(services)
    .set({ contentStatus: "draft", updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();
  return row;
}

/** Tarik halaman terbit kembali menjadi draf (riwayat revisi tetap utuh). */
export async function unpublishStaticPage(id: string): Promise<StaticPage> {
  const existing = await getStaticPageById(id);
  if (!existing) throw new Error("Halaman tidak ditemukan.");
  if (existing.contentStatus !== "published") {
    throw new Error("Hanya halaman terbit yang bisa ditarik kembali ke draf.");
  }

  const [row] = await db
    .update(staticPages)
    .set({ contentStatus: "draft", updatedAt: new Date() })
    .where(eq(staticPages.id, id))
    .returning();
  return row;
}

/* ------------------------------------------------------------------ */
/* Relasi galeri proyek (B1-2b)                                       */
/* ------------------------------------------------------------------ */

export type ProjectMediaSection = "sebelum" | "sesudah" | "galeri";

export type ProjectMediaItem = {
  relationId: string;
  mediaId: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  mediaType: "foto" | "video";
  mediaRole: "render" | "foto_lapangan";
  altEn: string | null;
  altId: string | null;
  consent: boolean;
  /** Media ikut di Trash (relasi tetap tampil agar bisa dilepas). */
  mediaTrashed: boolean;
  section: ProjectMediaSection | null;
  sortOrder: number;
};

/** Relasi galeri sebuah proyek (urut tampil), termasuk media yang di Trash. */
export async function listProjectMediaForAdmin(
  projectId: string
): Promise<ProjectMediaItem[]> {
  const rows = await db
    .select({
      relationId: projectMedia.id,
      mediaId: mediaAssets.id,
      fileUrl: mediaAssets.fileUrl,
      thumbnailUrl: mediaAssets.thumbnailUrl,
      mediaType: mediaAssets.mediaType,
      mediaRole: mediaAssets.mediaRole,
      altEn: mediaAssets.altTextEn,
      altId: mediaAssets.altTextId,
      consent: mediaAssets.consentConfirmed,
      deletedAt: mediaAssets.deletedAt,
      section: projectMedia.section,
      sortOrder: projectMedia.sortOrder,
    })
    .from(projectMedia)
    .innerJoin(mediaAssets, eq(projectMedia.mediaId, mediaAssets.id))
    .where(eq(projectMedia.projectId, projectId))
    .orderBy(asc(projectMedia.sortOrder), asc(projectMedia.createdAt));

  return rows.map((row) => ({
    relationId: row.relationId,
    mediaId: row.mediaId,
    fileUrl: row.fileUrl,
    thumbnailUrl: row.thumbnailUrl,
    mediaType: row.mediaType,
    mediaRole: row.mediaRole,
    altEn: row.altEn,
    altId: row.altId,
    consent: row.consent,
    mediaTrashed: row.deletedAt !== null,
    section: row.section,
    sortOrder: row.sortOrder,
  }));
}

/** Tempelkan media ke galeri proyek (media tidak boleh di Trash). */
export async function attachProjectMedia(
  projectId: string,
  mediaId: string,
  section: ProjectMediaSection | null
): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Proyek tidak ditemukan.");
  const media = await getMediaAssetById(mediaId);
  if (!media) throw new Error("Media tidak ditemukan atau sedang di Trash.");

  const existing = await db
    .select({ id: projectMedia.id })
    .from(projectMedia)
    .where(
      and(
        eq(projectMedia.projectId, projectId),
        eq(projectMedia.mediaId, mediaId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    throw new Error("Media itu sudah ada di galeri proyek ini.");
  }

  const maxRow = await db
    .select({ max: sql<number>`coalesce(max(${projectMedia.sortOrder}), 0)` })
    .from(projectMedia)
    .where(eq(projectMedia.projectId, projectId));

  await db.insert(projectMedia).values({
    id: `pm-${randomUUID()}`,
    projectId,
    mediaId,
    section,
    sortOrder: (maxRow[0]?.max ?? 0) + 1,
  });
}

/** Lepas media dari galeri proyek (tidak menghapus berkasnya). */
export async function detachProjectMedia(
  projectId: string,
  mediaId: string
): Promise<void> {
  const result = await db
    .delete(projectMedia)
    .where(
      and(
        eq(projectMedia.projectId, projectId),
        eq(projectMedia.mediaId, mediaId)
      )
    );
  if ((result.rowCount ?? 0) === 0) {
    throw new Error("Media tidak ditemukan di galeri proyek ini.");
  }
}

/**
 * Geser posisi media di galeri (tukar dengan tetangga terdekat).
 * Urutan disimpan lewat sortOrder; di ujung daftar aksi ini diam (tidak error).
 */
export async function moveProjectMedia(
  projectId: string,
  mediaId: string,
  direction: "naik" | "turun"
): Promise<void> {
  const items = await listProjectMediaForAdmin(projectId);
  const index = items.findIndex((item) => item.mediaId === mediaId);
  if (index < 0) throw new Error("Media tidak ditemukan di galeri proyek ini.");

  const swapIndex = direction === "naik" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const neighbour = items[swapIndex];
  // Slot bebas agar pertukaran aman meski nilai sortOrder sempat kembar.
  const maxRow = await db
    .select({ max: sql<number>`coalesce(max(${projectMedia.sortOrder}), 0)` })
    .from(projectMedia)
    .where(eq(projectMedia.projectId, projectId));
  const free = (maxRow[0]?.max ?? 0) + 1;

  await db
    .update(projectMedia)
    .set({ sortOrder: free })
    .where(eq(projectMedia.id, current.relationId));
  await db
    .update(projectMedia)
    .set({ sortOrder: current.sortOrder })
    .where(eq(projectMedia.id, neighbour.relationId));
  await db
    .update(projectMedia)
    .set({ sortOrder: neighbour.sortOrder })
    .where(eq(projectMedia.id, current.relationId));
}
