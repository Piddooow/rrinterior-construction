import { NextResponse } from "next/server";
import { getPublishedQuestions } from "@/lib/content";

export const dynamic = "force-dynamic";

/** GET /api/faqs: pertanyaan resmi terbit (dengan jawaban yang disetujui). */
export async function GET() {
  try {
    const data = await getPublishedQuestions();
    return NextResponse.json({ count: data.length, data });
  } catch {
    return NextResponse.json(
      { error: "Could not load questions." },
      { status: 500 }
    );
  }
}
