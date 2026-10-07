import { NextResponse } from "next/server";
import { getPublishedStaticPages } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/pages: daftar halaman teks terbit (dwibahasa). */
export async function GET() {
  try {
    const data = await getPublishedStaticPages();
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load pages." },
      { status: 500 }
    );
  }
}
