import {
  HeadBucketCommand,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { r2Config } from "../src/lib/r2.ts";

/**
 * Siapkan bucket R2 sekali jalan: cek akses kredensial + atur CORS untuk
 * upload langsung dari browser (dokumen §8.2.7). CORS dibatasi ke origin
 * situs (dev + produksi bila NEXT_PUBLIC_SITE_URL diisi), method
 * GET/PUT/HEAD, header content-type — bukan pengganti autentikasi.
 *
 * Jalankan: npm run r2:setup (butuh environment R2 di .env.local)
 */

const cfg = r2Config();
if (!cfg) {
  console.error(
    "Environment R2 belum lengkap: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL."
  );
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: cfg.endpoint,
  credentials: {
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
  },
});

try {
  await s3.send(new HeadBucketCommand({ Bucket: cfg.bucket }));
  console.log(`Bucket "${cfg.bucket}" dapat diakses dengan kredensial ini.`);
} catch (error) {
  console.error(
    "Tidak bisa mengakses bucket:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
}

const origins = ["http://localhost:3000", "http://localhost:3100"];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
if (siteUrl && !siteUrl.includes("localhost")) {
  try {
    origins.push(new URL(siteUrl).origin);
  } catch {
    console.error("NEXT_PUBLIC_SITE_URL tidak valid — dilewati.");
  }
}

await s3.send(
  new PutBucketCorsCommand({
    Bucket: cfg.bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: origins,
          AllowedMethods: ["GET", "PUT", "HEAD"],
          AllowedHeaders: ["content-type"],
          ExposeHeaders: ["etag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  })
);
console.log(`CORS diatur untuk origin: ${origins.join(", ")}`);
console.log(`URL publik delivery: ${cfg.publicBase}`);
