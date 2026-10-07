import { NextResponse } from "next/server";
import { getPublishedTestimonials } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/testimonials: testimoni resmi (terbit + izin terkonfirmasi). */
export async function GET() {
  try {
    const data = await getPublishedTestimonials();
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load testimonials." },
      { status: 500 }
    );
  }
}
