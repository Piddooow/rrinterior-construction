import { NextResponse } from "next/server";
import {
  getPublishedProjectBySlug,
  getPublishedProjectMedia,
} from "@/lib/content";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[slug]/media: media galeri proyek terbit —
 * berurutan sesuai relasi dan tersaring (siap + disetujui).
 */
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
    const data = await getPublishedProjectMedia(slug);
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load project media." },
      { status: 500 }
    );
  }
}
