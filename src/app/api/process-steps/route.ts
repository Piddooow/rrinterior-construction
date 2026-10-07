import { NextResponse } from "next/server";
import { getPublishedProcessSteps } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/process-steps: langkah proses kerja yang terbit. */
export async function GET() {
  try {
    const data = await getPublishedProcessSteps();
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load process steps." },
      { status: 500 }
    );
  }
}
