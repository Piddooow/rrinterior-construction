import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/settings: pengaturan publik (identitas & kanal kontak). */
export async function GET() {
  try {
    const data = await getPublicSettings();
    return NextResponse.json({ count: Object.keys(data).length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load site settings." },
      { status: 500 }
    );
  }
}
