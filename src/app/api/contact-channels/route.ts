import { NextResponse } from "next/server";
import { getPublicChannels } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/contact-channels: kanal kontak resmi dari pengaturan situs. */
export async function GET() {
  try {
    const data = await getPublicChannels();
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load contact channels." },
      { status: 500 }
    );
  }
}
