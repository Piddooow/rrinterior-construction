import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin-auth";
import { startR2Upload } from "@/lib/media-upload";
import { isR2Configured } from "@/lib/r2";

/**
 * Otorisasi upload langsung (dokumen §8.3.1): sesi admin, jenis berkas,
 * batas ukuran, dan tujuan diperiksa sebelum presigned URL diterbitkan.
 * Bila storage belum dikonfigurasi (transisi), klien memakai jalur unggah
 * lewat server yang lama.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid." },
      { status: 400 }
    );
  }

  if (!isR2Configured()) {
    // Mode transisi: unggah lewat server. Proxy admin (src/proxy.ts) memakai
    // batas clone body bawaan Next (10MB) — sisakan margin multipart agar
    // berkas tidak terpotong; klien menolak lebih awal lewat maxBytes.
    return NextResponse.json({ mode: "server", maxBytes: 9_500_000 });
  }

  try {
    const result = await startR2Upload({
      fileName: String(body.fileName ?? ""),
      mimeType: String(body.mimeType ?? ""),
      size: Number(body.size ?? 0),
      mediaRole: String(body.mediaRole ?? ""),
      altTextEn: typeof body.altTextEn === "string" ? body.altTextEn : null,
      altTextId: typeof body.altTextId === "string" ? body.altTextId : null,
      credit: typeof body.credit === "string" ? body.credit : null,
      consentConfirmed: body.consentConfirmed === true,
    });
    return NextResponse.json({ mode: "r2", ...result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal menyiapkan upload.",
      },
      { status: 400 }
    );
  }
}
