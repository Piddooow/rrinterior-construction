/**
 * Kanal resmi RR (dari brief yang sudah dikonfirmasi).
 * WhatsApp: 08568122119 (tampil) / 628568122119 (digit wa.me).
 */
export const SITE = {
  whatsappNumber: "628568122119",
  phoneDisplay: "0856-8122-119",
  instagram: "https://www.instagram.com/rrinterior.construction/",
  instagramHandle: "@rrinterior.construction",
  /** Alamat email resmi (dikonfirmasi RR; dipakai komponen salin di footer). */
  email: "rrinterior.construction@gmail.com",
  /** Pendiri RR (dikonfirmasi RR); kanal Instagram pribadi untuk kartu pendiri. */
  founder: {
    name: "Rangga Harahap",
    instagram: "https://www.instagram.com/ranggaraster/",
    instagramHandle: "@ranggaraster",
  },
} as const;

/** Tautan WhatsApp dengan pesan siap edit (pengunjung yang menekan kirim). */
export function waHref(message: string): string {
  return (
    whatsAppLink(SITE.whatsappNumber, message) ??
    `https://wa.me/${SITE.whatsappNumber}`
  );
}

/**
 * Nomor WhatsApp tervalidasi untuk tautan wa.me: hanya digit, panjang
 * wajar (8–15), dan format internasional (tanpa awalan 0 atau tanda +).
 * Mengembalikan null bila tidak valid agar pemanggil memilih fallback.
 */
export function normalizeWhatsAppNumber(
  value: string | null | undefined
): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.startsWith("0")) return null;
  return digits;
}

/** Tautan wa.me tervalidasi dengan pesan siap edit; null bila nomor tidak valid. */
export function whatsAppLink(
  number: string | null | undefined,
  message?: string
): string | null {
  const digits = normalizeWhatsAppNumber(number);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * URL absolut untuk tautan yang dibagikan (mis. rujukan proyek di pesan
 * WhatsApp). Basis mengikuti NEXT_PUBLIC_SITE_URL seperti metadata situs.
 */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
