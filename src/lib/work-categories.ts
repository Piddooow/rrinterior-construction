import type { Dictionary } from "@/i18n";

/**
 * Kategori karya (tiga kelompok tetap) — satu sumber untuk tautan
 * dropdown/footer (nav.ts) dan section halaman Karya (/projects#hunian dst).
 *
 * `CATEGORY_BY_SLUG` adalah hasil kurasi manual (dicek satu per satu).
 * Proyek baru yang ditambahkan lewat admin (belum ada di peta) jatuh ke
 * pencocokan kata kunci pada lingkup kerja — cukup untuk mencetak kategori
 * yang wajar, bukan pengganti kurasi.
 */
export const WORK_CATEGORY_IDS = ["hunian", "komersial", "furnitur"] as const;

export type WorkCategoryId = (typeof WORK_CATEGORY_IDS)[number];

export function workCategoryHref(
  locale: string,
  id: WorkCategoryId
): string {
  return `/${locale}/projects#${id}`;
}

const CATEGORY_BY_SLUG: Record<string, WorkCategoryId> = {
  // Hunian
  "house-renovation-tangerang": "hunian",
  "apartment-interior-bsd": "hunian",
  "living-room-nature-classic": "hunian",
  "bedroom-toilet-warm-minimalist": "hunian",
  "apartment-family-area": "hunian",
  "house-renovation-documentation": "hunian",
  "modern-house-exterior": "hunian",
  "bedroom-work-space": "hunian",
  "house-facade-design": "hunian",
  "residential-home-tangerang": "hunian",
  // Komersial & hospitality
  "guest-house-design-cilegon": "komersial",
  "restaurant-cikarang": "komersial",
  "coffee-shop-design-rustic": "komersial",
  "clothing-store-bogor": "komersial",
  "barbershop-re-design": "komersial",
  "office-meeting-room": "komersial",
  "auditorium-design": "komersial",
  "sushi-restaurant-design": "komersial",
  "cake-shop-karawang": "komersial",
  "restaurant-interior-concept": "komersial",
  "cafe-design-concept": "komersial",
  "warehouse-north-jakarta": "komersial",
  // Furnitur & interior kustom
  "residential-furniture-meruya": "furnitur",
  "kitchen-set-design": "furnitur",
  "compact-kitchen-set": "furnitur",
};

export function workCategoryFor(
  slug: string,
  scopeEn?: string | null
): WorkCategoryId {
  const mapped = CATEGORY_BY_SLUG[slug];
  if (mapped) return mapped;

  const scope = (scopeEn ?? "").toLowerCase();
  if (/furniture|kitchen|wardrobe|joinery/.test(scope)) return "furnitur";
  if (
    /restaurant|cafe|retail|office|commercial|warehouse|auditorium|guest house|store|shop/.test(
      scope
    )
  ) {
    return "komersial";
  }
  return "hunian";
}

export function workCategoryLabels(
  dict: Dictionary
): Record<WorkCategoryId, { label: string; description: string }> {
  return {
    hunian: {
      label: dict.navMenu.categoryHunian,
      description: dict.navMenu.categoryHunianDesc,
    },
    komersial: {
      label: dict.navMenu.categoryKomersial,
      description: dict.navMenu.categoryKomersialDesc,
    },
    furnitur: {
      label: dict.navMenu.categoryFurnitur,
      description: dict.navMenu.categoryFurniturDesc,
    },
  };
}
