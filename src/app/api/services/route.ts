import { NextResponse } from "next/server";
import { getPublishedServices } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/services: layanan terkonfirmasi yang terbit. */
export async function GET() {
  try {
    const data = await getPublishedServices();
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load services." },
      { status: 500 }
    );
  }
}
