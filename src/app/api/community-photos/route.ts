import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const runtime = "edge";

async function ensureCommunityPhotosTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS community_photos (
        id TEXT NOT NULL PRIMARY KEY,
        title TEXT NOT NULL,
        title_ar TEXT,
        title_en TEXT,
        image_url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        submitted_by_name TEXT,
        submitted_by_email TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`
    )
    .run();
  // Backward-compatible migration for older local DBs.
  try {
    await db.prepare(`ALTER TABLE community_photos ADD COLUMN title_ar TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE community_photos ADD COLUMN title_en TEXT`).run();
  } catch {}
  try {
    await db
      .prepare(
        `UPDATE community_photos
         SET title_ar = COALESCE(title_ar, title),
             title_en = COALESCE(title_en, title)
         WHERE title_ar IS NULL OR title_en IS NULL`
      )
      .run();
  } catch {}
  return db;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titleAr = String(formData.get("title_ar") ?? "").trim();
    const titleEn = String(formData.get("title_en") ?? "").trim();
    const imageUrl = String(formData.get("image_url") ?? "").trim();
    const submittedByName =
      String(formData.get("submitted_by_name") ?? "").trim() || null;
    const submittedByEmail =
      String(formData.get("submitted_by_email") ?? "").trim() || null;

    if (!submittedByName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!submittedByEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!titleAr) {
      return NextResponse.json({ error: "Arabic title is required" }, { status: 400 });
    }
    if (!titleEn) {
      return NextResponse.json({ error: "English title is required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submittedByEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!imageUrl) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    }

    const db = await ensureCommunityPhotosTable();
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO community_photos
         (id, title, title_ar, title_en, image_url, status, submitted_by_name, submitted_by_email)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
      )
      .bind(id, titleAr, titleAr, titleEn, imageUrl, submittedByName, submittedByEmail)
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/community-photos failed:", err);
    return NextResponse.json({ error: "Failed to submit photo" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await ensureCommunityPhotosTable();
    const { results } = await db
      .prepare(
        `SELECT id, title, title_ar, title_en, image_url, created_at
         FROM community_photos
         WHERE status = 'approved'
         ORDER BY created_at DESC`
      )
      .all();
    return NextResponse.json({ photos: results ?? [] });
  } catch (err) {
    console.error("GET /api/community-photos failed:", err);
    return NextResponse.json({ photos: [] }, { status: 200 });
  }
}
