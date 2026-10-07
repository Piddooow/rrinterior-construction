import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin-auth";
import { finalizeR2Upload } from "@/lib/media-upload";
import { revalidatePublicSite } from "@/lib/revalidate";

/**
 * Tahap finalisasi upload langsung (dokumen §8.3.3/8.3.4): server
 * memverifikasi objek nyata (ada, ukuran, signature) sebelum media
 * dianggap masuk pustaka, lalu cache publik diinvalidasi (§8.4.3).
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  let mediaId = "";
  try {
    const body = (await request.json()) as Record<string, unknown>;
    mediaId = String(body.mediaId ?? "");
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak valid." },
      { status: 400 }
    );
  }
  if (!mediaId) {
    return NextResponse.json({ error: "mediaId wajib diisi." }, { status: 400 });
  }

  try {
    const media = await finalizeR2Upload(mediaId);
    revalidatePublicSite();
    return NextResponse.json({
      ok: true,
      media: { id: media.id, fileUrl: media.fileUrl, name: media.name },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Verifikasi upload gagal.",
      },
      { status: 400 }
    );
  }
}
