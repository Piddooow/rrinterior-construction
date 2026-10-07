import { NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/projects: daftar proyek terbit untuk halaman publik. */
export async function GET() {
  try {
    const data = await getPublishedProjects();
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load projects." },
      { status: 500 }
    );
  }
}
