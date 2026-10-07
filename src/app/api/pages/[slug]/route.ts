import { NextResponse } from "next/server";
import { getPublishedStaticPageBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/pages/[slug]: satu halaman terbit (draft/terhapus → 404). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await getPublishedStaticPageBySlug(slug);
    if (!page) {
      return NextResponse.json({ error: "Page not found." }, { status: 404 });
    }
    return NextResponse.json({ data: page });
  } catch {
    return NextResponse.json(
      { error: "Could not load page." },
      { status: 500 }
    );
  }
}
