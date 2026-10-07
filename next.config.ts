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

/*
 * Origin object storage (R2). Selama environment belum diisi, daftar kosong
 * dan kebijakan tetap persis seperti sebelumnya. Begitu R2 dikonfigurasi:
 * - domain publik delivery masuk img-src/media-src + remotePatterns next/image;
 * - endpoint S3 masuk connect-src (tujuan PUT presigned dari browser).
 */
const r2Public = (() => {
  const raw = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return {
      origin: url.origin,
      protocol: url.protocol === "http:" ? ("http" as const) : ("https" as const),
      hostname: url.hostname,
      port: url.port,
    };
  } catch {
    return null;
  }
})();
const r2S3Origin = process.env.R2_ACCOUNT_ID?.trim()
  ? `https://${process.env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`
  : null;

const CSP = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${r2Public ? ` ${r2Public.origin}` : ""}`,
  "font-src 'self' data:",
  `media-src 'self' blob:${r2Public ? ` ${r2Public.origin}` : ""}`,
  `connect-src 'self'${r2S3Origin ? ` ${r2S3Origin}` : ""}`,
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
  // Gambar dari domain delivery R2 (dokumen §8.6.4) — hanya bila dikonfigurasi.
  ...(r2Public
    ? {
        images: {
          remotePatterns: [
            {
              protocol: r2Public.protocol,
              hostname: r2Public.hostname,
              ...(r2Public.port ? { port: r2Public.port } : {}),
            },
          ],
        },
      }
    : {}),
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
