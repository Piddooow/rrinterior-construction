import { NextResponse } from "next/server";
import { getPublishedProjectBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/projects/[slug]: detail proyek terbit (draft/trashed → 404). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = await getPublishedProjectBySlug(slug);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: project });
  } catch {
    return NextResponse.json(
      { error: "Could not load project." },
      { status: 500 }
    );
  }
}
