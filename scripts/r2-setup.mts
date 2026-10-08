import {
  HeadBucketCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { r2Config } from "../src/lib/r2.ts";

/**
 * Siapkan/verifikasi bucket R2 (dokumen §8.2.7):
 *
 * 1. Cek kredensial aplikasi (object-level: HeadBucket, jatuh ke
 *    ListObjectsV2 bila kredensial sengaja tanpa izin admin bucket).
 * 2. Atur CORS untuk upload langsung dari browser — bila kredensial tidak
 *    berizin admin bucket, langkah ini dilewati dengan panduan (CORS tetap
 *    wajib ada; atur lewat `cf r2 buckets cors update` atau dashboard).
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

// 1) Cek akses kredensial aplikasi.
try {
  await s3.send(new HeadBucketCommand({ Bucket: cfg.bucket }));
  console.log(`Bucket "${cfg.bucket}" dapat diakses dengan kredensial ini.`);
} catch {
  try {
    await s3.send(
      new ListObjectsV2Command({ Bucket: cfg.bucket, Prefix: "uploads/", MaxKeys: 1 })
    );
    console.log(
      `Kredensial object-level OK untuk bucket "${cfg.bucket}" ` +
        "(tanpa izin admin bucket — memang disarankan)."
    );
  } catch (error) {
    console.error(
      "Kredensial tidak bisa mengakses bucket:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// 2) CORS untuk upload langsung dari browser.
const origins = [
  "http://localhost:3000",
  "http://localhost:3100",
  "http://localhost:3101",
];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
if (siteUrl && !siteUrl.includes("localhost")) {
  try {
    origins.push(new URL(siteUrl).origin);
  } catch {
    console.error("NEXT_PUBLIC_SITE_URL tidak valid — dilewati.");
  }
}

try {
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
} catch {
  console.warn(
    "CORS dilewati: kredensial aplikasi tidak berizin admin bucket " +
      "(disarankan begitu). Pastikan CORS sudah diatur sekali lewat " +
      "`cf r2 buckets cors update <bucket>` atau dashboard, dengan origin: " +
      origins.join(", ")
  );
}

console.log(`URL publik delivery: ${cfg.publicBase}`);
