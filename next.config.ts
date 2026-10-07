import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/*
 * Origin tambahan untuk Server Actions (CSRF dua lapis: Next selalu
 * membandingkan Origin dengan Host; daftar ini hanya diperlukan bila kelak
 * situs dilayani lewat proxy/CDN dengan host berbeda). Diisi otomatis dari
 * NEXT_PUBLIC_SITE_URL saat domain produksi ditetapkan (A5).
 */
const allowedOrigins = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw || !raw.startsWith("http")) return [];
  try {
    const host = new URL(raw).host;
    return host && !host.startsWith("localhost") ? [host, `**.${host}`] : [];
  } catch {
    return [];
  }
})();

/*
 * CSP pragmatis (R5; dibedakan per environment sejak R8): situs ini
 * statis/ISR, sedangkan nonce CSP menuntut seluruh halaman dirender dinamis
 * (panduan CSP Next). Karena itu skrip memakai 'unsafe-inline' TANPA
 * 'unsafe-eval' di PRODUKSI (React/Next tidak memakai eval di produksi),
 * sementara seluruh directive sumber daya lain tetap ketat.
 *
 * Di DEVELOPMENT saja, 'unsafe-eval' ditambahkan karena React/Turbopack dev
 * memang membutuhkannya untuk debugging dan HMR — tanpa ini konsol dev
 * dipenuhi peringatan "eval() is not supported". Produksi tidak pernah
 * mendapat kelonggaran ini (dikunci oleh harness s-audit).
 * Opsi CSP ketat penuh (nonce + dynamic rendering) dicatat di laporan.
 */
const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const CSP = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HSTS hanya bermanfaat di atas HTTPS (diabaikan peramban pada HTTP lokal).
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
    : []),
];

const nextConfig: NextConfig = {
  // Jangan bocorkan teknologi server lewat header X-Powered-By.
  poweredByHeader: false,
  // better-sqlite3 adalah modul native; jangan di-bundle oleh Turbopack.
  serverExternalPackages: ["better-sqlite3"],
  /*
   * Unggahan media lewat Server Action: batas bawaan 1MB terlalu kecil untuk
   * berkas foto/video (validasi jenis & ukuran sebenarnya ada di
   * lib/media-upload.ts: 10MB foto / 100MB video — sisakan ruang overhead
   * multipart).
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "110mb",
      ...(allowedOrigins.length ? { allowedOrigins } : {}),
    },
  },
  /*
   * Preview produksi (build + start) memakai distDir terpisah agar tidak
   * menimpa cache `.next` milik dev server pengembang — pemicu error HMR
   * "No link element found for chunk ...css" pada Turbopack.
   * Dev: .next (default) · Preview: NEXT_DIST_DIR=.next-build
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
