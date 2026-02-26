export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const authorName = String(formData.get("author_name") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

    if (!authorName || !content) {
      return NextResponse.json(
        { success: false, error: "Name and story content are required" },
        { status: 400 }
      );
    }

    const db = await getDB();
    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO stories (id, author_name, content, image_url, status)
         VALUES (?, ?, ?, ?, 'pending')`
      )
      .bind(id, authorName, content, imageUrl)
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/stories error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to submit story",
      },
      { status: 500 }
    );
  }
}
