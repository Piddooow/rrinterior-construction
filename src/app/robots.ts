import type { MetadataRoute } from "next";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/**
 * Aturan crawler (R5): seluruh halaman publik boleh dijelajah; area panel
 * dan API ditutup agar tidak pernah muncul di hasil pencarian. Lokasi peta
 * situs ditunjuk eksplisit agar penemuan halaman baru lebih cepat.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
