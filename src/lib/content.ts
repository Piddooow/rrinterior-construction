import { and, asc, eq, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  faqs,
  mediaAssets,
  processSteps,
  projects,
  projectMedia,
  services,
  siteSettings,
  staticPages,
  testimonials,
  type Project,
} from "@/db/schema";
import { slugify } from "@/lib/utils";
import { normalizeWhatsAppNumber, whatsAppLink } from "@/lib/site";

/** Nilai teks bilingual; sisi yang belum diisi bernilai null. */
export type LocalizedText = { en: string | null; id: string | null };

export type PublicProject = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  scopeOfWork: LocalizedText;
  roomType: string | null;
  generalLocation: string | null;
  /** Shortcode postingan arsip asal (provenance); null bila tidak ada. */
  sourcePost: string | null;
  projectStatus: "selesai" | "berjalan" | null;
  yearCompleted: number | null;
  /** Waktu data dibuat — dipakai beranda untuk urutan terbaru → terlama. */
  createdAt: Date | null;
  /** Waktu suntingan terakhir — dipakai peta situs (lastModified). */
  updatedAt: Date | null;
  cover: {
    url: string;
    role: "render" | "foto_lapangan" | null;
    alt: LocalizedText;
  } | null;
};

/** Media galeri proyek untuk halaman publik (urutan dari project_media). */
export type PublicProjectMedia = {
  id: string;
  type: "foto" | "video";
  role: "render" | "foto_lapangan";
  src: string;
  poster: string | null;
  alt: LocalizedText;
  caption: LocalizedText | null;
  credit: string | null;
  order: number;
  section: string | null;
};

/** Halaman teks statis (Tentang, Kebijakan Privasi) untuk publik. */
export type PublicStaticPage = {
  slug: string;
  title: LocalizedText;
  body: LocalizedText;
  updatedAt: Date | null;
};

export type PublicService = {
  number: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  updatedAt: Date | null;
};

export type PublicProcessStep = {
  number: string;
  title: LocalizedText;
  description: LocalizedText;
};

export type PublicSettings = Record<
  string,
  { group: string; value: LocalizedText }
>;

/** Kanal kontak resmi untuk halaman publik (dari pengaturan situs). */
export type PublicChannel = {
  key: "whatsapp" | "instagram";
  handle: string;
  href: string;
};

/** Pertanyaan resmi dengan jawaban yang disetujui RR. */
export type PublicQuestion = {
  question: LocalizedText;
  answer: LocalizedText;
  updatedAt: Date | null;
};

/** Testimoni dengan izin & identitas yang disetujui. */
export type PublicTestimonial = {
  quote: LocalizedText;
  author: string;
  context: LocalizedText | null;
};

/**
 * Saringan direktori proyek. `location` & `type` memakai slug URL yang
 * sama dengan chip filter (hasil slugify nilai database).
 */
export type PublicProjectFilters = {
  location?: string;
  type?: string;
  status?: string;
  q?: string;
};

/** Pola LIKE aman: `%`, `_`, dan `\` diperlakukan literal. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Kueri konten publik langsung dari database.
 * Dipakai halaman server (build/ISR) dan route API agar satu sumber.
 * Jika database belum siap (masih kosong/terkunci), kembalikan daftar
 * kosong dan catat ke log server; halaman menampilkan keadaan kosong.
 */

function toPublicProject(row: Project): PublicProject {
  return {
    slug: row.slug,
    title: { en: row.titleEn, id: row.titleId },
    summary: { en: row.summaryEn, id: row.summaryId },
    scopeOfWork: { en: row.scopeOfWorkEn, id: row.scopeOfWorkId },
    roomType: row.roomType,
    generalLocation: row.generalLocation,
    sourcePost: row.sourcePost,
    projectStatus: row.projectStatus,
    yearCompleted: row.yearCompleted,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    cover: row.coverUrl
      ? {
          url: row.coverUrl,
          role: row.coverRole,
          alt: { en: row.coverAltEn, id: row.coverAltId },
        }
      : null,
  };
}

/** Nilai database yang slug-nya sama dengan parameter filter. */
function slugMatches(values: (string | null)[], param: string): string[] {
  return values
    .filter((value): value is string => Boolean(value))
    .filter((value) => slugify(value) === param);
}

/** Kategori penyaring direktori yang tersedia dari proyek terbit. */
export type PublicProjectFilterOptions = {
  /** Lokasi umum unik (nilai tampilan; slug URL dihitung dengan `slugify`). */
  locations: string[];
  /** Jenis pekerjaan unik: slug URL + label dwibahasa. */
  types: { value: string; label: LocalizedText }[];
  /** Status proyek yang dapat disaring. */
  statuses: ("selesai" | "berjalan")[];
};

/**
 * Opsi chip filter direktori: lokasi & jenis unik dari proyek terbit,
 * urut kemunculan sesuai sort_order (sama dengan tampilan direktori).
 */
export async function getPublishedProjectFilterOptions(): Promise<PublicProjectFilterOptions> {
  try {
    const rows = await db
      .select({
        location: projects.generalLocation,
        scopeEn: projects.scopeOfWorkEn,
        scopeId: projects.scopeOfWorkId,
      })
      .from(projects)
      .where(
        and(
          eq(projects.contentStatus, "published"),
          isNull(projects.deletedAt)
        )
      )
      .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

    const locations: string[] = [];
    const types: { value: string; label: LocalizedText }[] = [];
    const seenTypes = new Set<string>();
    for (const row of rows) {
      if (row.location && !locations.includes(row.location)) {
        locations.push(row.location);
      }
      const value = slugify(row.scopeEn ?? row.scopeId ?? "");
      if (value && !seenTypes.has(value)) {
        seenTypes.add(value);
        types.push({ value, label: { en: row.scopeEn, id: row.scopeId } });
      }
    }

    return { locations, types, statuses: ["selesai", "berjalan"] };
  } catch (error) {
    console.error("getPublishedProjectFilterOptions gagal:", error);
    return { locations: [], types: [], statuses: [] };
  }
}

/**
 * Daftar proyek terbit (published-only), terurut sort_order.
 * Saringan opsional query saring & cari direktori:
 * - `location` / `type`: slug URL dari nilai database (lihat `slugify`);
 *   parameter tanpa kecocokan menghasilkan daftar kosong, bukan diabaikan.
 * - `status`: `selesai` / `berjalan`; nilai lain dianggap tidak cocok.
 * - `q`: pencarian bebas pada judul, lokasi, dan lingkup kerja (EN/ID);
 *   dicocokkan pada gabungan teks yang sama dengan tampilan direktori.
 */
export async function getPublishedProjects(
  filters?: PublicProjectFilters
): Promise<PublicProject[]> {
  try {
    const published = and(
      eq(projects.contentStatus, "published"),
      isNull(projects.deletedAt)
    );
    const conditions = [published];

    if (filters?.status) {
      if (filters.status !== "selesai" && filters.status !== "berjalan") {
        return [];
      }
      conditions.push(eq(projects.projectStatus, filters.status));
    }

    if (filters?.q?.trim()) {
      const pattern = `%${escapeLike(filters.q.trim().toLowerCase())}%`;
      const haystack = sql`lower(concat_ws(' ', nullif(${projects.titleEn}, ''), nullif(${projects.titleId}, ''), nullif(${projects.generalLocation}, ''), nullif(${projects.scopeOfWorkEn}, ''), nullif(${projects.scopeOfWorkId}, '')))`;
      conditions.push(sql`${haystack} LIKE ${pattern} ESCAPE '\\'`);
    }

    if (filters?.location) {
      const rows = await db
        .selectDistinct({ value: projects.generalLocation })
        .from(projects)
        .where(published);
      const values = slugMatches(
        rows.map((row) => row.value),
        filters.location
      );
      if (values.length === 0) return [];
      conditions.push(inArray(projects.generalLocation, values));
    }

    if (filters?.type) {
      const typeValue = sql<
        string
      >`coalesce(${projects.scopeOfWorkEn}, ${projects.scopeOfWorkId})`;
      const rows = await db
        .selectDistinct({ value: typeValue })
        .from(projects)
        .where(published);
      const values = slugMatches(
        rows.map((row) => row.value),
        filters.type
      );
      if (values.length === 0) return [];
      conditions.push(inArray(typeValue, values));
    }

    const rows = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

    return rows.map(toPublicProject);
  } catch (error) {
    console.error("getPublishedProjects gagal:", error);
    return [];
  }
}

export async function getPublishedProjectBySlug(
  slug: string
): Promise<PublicProject | null> {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.slug, slug),
          eq(projects.contentStatus, "published"),
          isNull(projects.deletedAt)
        )
      )
      .limit(1);

    return rows[0] ? toPublicProject(rows[0]) : null;
  } catch (error) {
    console.error("getPublishedProjectBySlug gagal:", error);
    return null;
  }
}

/**
 * Media proyek terbit untuk galeri publik: berurutan sesuai sort_order
 * relasi, tersaring hanya berkas siap (upload sukses), disetujui
 * (consent_confirmed), dan tidak terhapus. Proyek non-terbit → kosong.
 */
export async function getPublishedProjectMedia(
  slug: string
): Promise<PublicProjectMedia[]> {
  try {
    const rows = await db
      .select({
        id: mediaAssets.id,
        mediaType: mediaAssets.mediaType,
        mediaRole: mediaAssets.mediaRole,
        fileUrl: mediaAssets.fileUrl,
        thumbnailUrl: mediaAssets.thumbnailUrl,
        altTextEn: mediaAssets.altTextEn,
        altTextId: mediaAssets.altTextId,
        captionEn: mediaAssets.captionEn,
        captionId: mediaAssets.captionId,
        credit: mediaAssets.credit,
        sortOrder: projectMedia.sortOrder,
        section: projectMedia.section,
      })
      .from(projectMedia)
      .innerJoin(mediaAssets, eq(projectMedia.mediaId, mediaAssets.id))
      .innerJoin(projects, eq(projectMedia.projectId, projects.id))
      .where(
        and(
          eq(projects.slug, slug),
          eq(projects.contentStatus, "published"),
          isNull(projects.deletedAt),
          isNull(mediaAssets.deletedAt),
          eq(mediaAssets.uploadStatus, "sukses"),
          eq(mediaAssets.consentConfirmed, true)
        )
      )
      .orderBy(asc(projectMedia.sortOrder), asc(projectMedia.createdAt));

    return rows.map((row) => ({
      id: row.id,
      type: row.mediaType,
      role: row.mediaRole,
      src: row.fileUrl,
      poster: row.thumbnailUrl,
      alt: { en: row.altTextEn, id: row.altTextId },
      caption:
        row.captionEn || row.captionId
          ? { en: row.captionEn, id: row.captionId }
          : null,
      credit: row.credit,
      order: row.sortOrder,
      section: row.section,
    }));
  } catch (error) {
    console.error("getPublishedProjectMedia gagal:", error);
    return [];
  }
}

export async function getPublishedServices(): Promise<PublicService[]> {
  try {
    const rows = await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.contentStatus, "published"),
          isNull(services.deletedAt)
        )
      )
      .orderBy(asc(services.sortOrder), asc(services.createdAt));

    return rows.map((row, index) => ({
      number: String(index + 1).padStart(2, "0"),
      slug: row.slug,
      title: { en: row.titleEn, id: row.titleId },
      description: { en: row.descriptionEn, id: row.descriptionId },
      updatedAt: row.updatedAt,
    }));
  } catch (error) {
    console.error("getPublishedServices gagal:", error);
    return [];
  }
}

export async function getPublishedProcessSteps(): Promise<
  PublicProcessStep[]
> {
  try {
    const rows = await db
      .select()
      .from(processSteps)
      .where(
        and(
          eq(processSteps.contentStatus, "published"),
          isNull(processSteps.deletedAt)
        )
      )
      .orderBy(asc(processSteps.sortOrder), asc(processSteps.createdAt));

    return rows.map((row, index) => ({
      number: String(index + 1).padStart(2, "0"),
      title: { en: row.titleEn, id: row.titleId },
      description: { en: row.descriptionEn, id: row.descriptionId },
    }));
  } catch (error) {
    console.error("getPublishedProcessSteps gagal:", error);
    return [];
  }
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .orderBy(asc(siteSettings.group), asc(siteSettings.key));

    const data: PublicSettings = {};
    for (const row of rows) {
      data[row.key] = {
        group: row.group,
        value: { en: row.valueEn, id: row.valueId },
      };
    }
    return data;
  } catch (error) {
    console.error("getPublicSettings gagal:", error);
    return {};
  }
}

/**
 * Kanal kontak resmi dari pengaturan situs (nomor WhatsApp kanonik +
 * tautan Instagram). Kanal yang belum diisi pengaturannya tidak muncul.
 */
export async function getPublicChannels(): Promise<PublicChannel[]> {
  const settings = await getPublicSettings();
  const text = (key: string): string | null => {
    const value = settings[key]?.value;
    return value?.en ?? value?.id ?? null;
  };

  const channels: PublicChannel[] = [];
  const whatsappDigits = normalizeWhatsAppNumber(text("whatsapp_number"));
  const whatsappHref = whatsAppLink(whatsappDigits);
  if (whatsappDigits && whatsappHref) {
    channels.push({
      key: "whatsapp",
      handle: text("whatsapp_display") ?? whatsappDigits,
      href: whatsappHref,
    });
  }

  const instagramUrl = text("instagram_url");
  if (instagramUrl) {
    channels.push({
      key: "instagram",
      handle: text("instagram_handle") ?? instagramUrl,
      href: instagramUrl,
    });
  }

  return channels;
}

/**
 * Pertanyaan resmi terbit (PRD §6.8): published, belum dihapus, dan sudah
 * punya jawaban agar tidak ada heading kosong (QC22). Urut sort_order.
 */
export async function getPublishedQuestions(): Promise<PublicQuestion[]> {
  try {
    const rows = await db
      .select()
      .from(faqs)
      .where(
        and(
          eq(faqs.contentStatus, "published"),
          isNull(faqs.deletedAt),
          or(isNotNull(faqs.answerEn), isNotNull(faqs.answerId))
        )
      )
      .orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));

    return rows.map((row) => ({
      question: { en: row.questionEn, id: row.questionId },
      answer: { en: row.answerEn, id: row.answerId },
      updatedAt: row.updatedAt,
    }));
  } catch (error) {
    console.error("getPublishedQuestions gagal:", error);
    return [];
  }
}

/**
 * Testimoni resmi terbit (PRD §6.7): hanya yang published, belum dihapus,
 * dan permission_confirmed. Konteks proyek hanya bila proyeknya publik.
 */
export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const rows = await db
      .select({
        quoteEn: testimonials.quoteEn,
        quoteId: testimonials.quoteId,
        author: testimonials.clientDisplayName,
        projectTitleEn: projects.titleEn,
        projectTitleId: projects.titleId,
      })
      .from(testimonials)
      .leftJoin(
        projects,
        and(
          eq(testimonials.projectId, projects.id),
          eq(projects.contentStatus, "published"),
          isNull(projects.deletedAt)
        )
      )
      .where(
        and(
          eq(testimonials.contentStatus, "published"),
          eq(testimonials.permissionConfirmed, true),
          isNull(testimonials.deletedAt)
        )
      )
      .orderBy(asc(testimonials.sortOrder), asc(testimonials.createdAt));

    return rows.map((row) => ({
      quote: { en: row.quoteEn, id: row.quoteId },
      author: row.author ?? "",
      context:
        row.projectTitleEn || row.projectTitleId
          ? { en: row.projectTitleEn, id: row.projectTitleId }
          : null,
    }));
  } catch (error) {
    console.error("getPublishedTestimonials gagal:", error);
    return [];
  }
}

/** Daftar halaman teks terbit (Tentang, Kebijakan Privasi, dst.). */
export async function getPublishedStaticPages(): Promise<PublicStaticPage[]> {
  try {
    const rows = await db
      .select()
      .from(staticPages)
      .where(
        and(
          eq(staticPages.contentStatus, "published"),
          isNull(staticPages.deletedAt)
        )
      )
      .orderBy(asc(staticPages.sortOrder), asc(staticPages.createdAt));

    return rows.map((row) => ({
      slug: row.slug,
      title: { en: row.titleEn, id: row.titleId },
      body: { en: row.bodyEn, id: row.bodyId },
      updatedAt: row.updatedAt,
    }));
  } catch (error) {
    console.error("getPublishedStaticPages gagal:", error);
    return [];
  }
}

/** Satu halaman teks terbit berdasarkan slug (null bila tidak ada/draft). */
export async function getPublishedStaticPageBySlug(
  slug: string
): Promise<PublicStaticPage | null> {
  try {
    const rows = await db
      .select()
      .from(staticPages)
      .where(
        and(
          eq(staticPages.slug, slug),
          eq(staticPages.contentStatus, "published"),
          isNull(staticPages.deletedAt)
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return {
      slug: row.slug,
      title: { en: row.titleEn, id: row.titleId },
      body: { en: row.bodyEn, id: row.bodyId },
      updatedAt: row.updatedAt,
    };
  } catch (error) {
    console.error("getPublishedStaticPageBySlug gagal:", error);
    return null;
  }
}
