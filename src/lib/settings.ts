import type { Dictionary, Locale } from "@/i18n";
import type { PublicSettings } from "@/lib/content";

/**
 * Timpa teks situs dengan pengaturan dari database (bila sudah diisi),
 * agar tim RR bisa mengubah pesan WhatsApp & teks persiapan tanpa kode.
 * Nilai kosong/tidak ada mempertahankan teks bawaan kamus.
 */
export function applySiteSettings(
  dict: Dictionary,
  settings: PublicSettings,
  locale: Locale
): Dictionary {
  const text = (key: string): string | null => {
    const value = settings[key]?.value;
    if (!value) return null;
    return value[locale] ?? value.en ?? value.id ?? null;
  };

  return {
    ...dict,
    wa: {
      ...dict.wa,
      base: text("wa_message_base") ?? dict.wa.base,
      project: text("wa_message_project") ?? dict.wa.project,
      services: text("wa_message_services") ?? dict.wa.services,
    },
    servicesPage: {
      ...dict.servicesPage,
      prepTitle: text("prep_title") ?? dict.servicesPage.prepTitle,
      prepBody: text("prep_body") ?? dict.servicesPage.prepBody,
    },
  };
}
