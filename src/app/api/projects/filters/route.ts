import { NextResponse } from "next/server";
import { getPublishedProjectFilterOptions } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/projects/filters: kategori penyaring direktori yang tersedia. */
export async function GET() {
  try {
    const data = await getPublishedProjectFilterOptions();
    const count =
      data.locations.length + data.types.length + data.statuses.length;
    return NextResponse.json({ count, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load project filters." },
      { status: 500 }
    );
  }
}
