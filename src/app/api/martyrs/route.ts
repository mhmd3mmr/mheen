export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

async function ensureMartyrsTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS martyrs (
        id TEXT NOT NULL PRIMARY KEY,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        birth_date TEXT,
        death_date TEXT,
        bio_ar TEXT,
        bio_en TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'approved',
        submitted_by TEXT
      )`
    )
    .run();

  // Backward-compatible migration for older production DBs.
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN birth_date TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN death_date TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN bio_ar TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN bio_en TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN image_url TEXT`).run();
  } catch {}
  try {
    await db
      .prepare(`ALTER TABLE martyrs ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'`)
      .run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN submitted_by TEXT`).run();
  } catch {}

  return db;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nameAr = String(formData.get("name_ar") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    const birthDate = String(formData.get("birth_date") ?? "").trim() || null;
    const deathDate = String(formData.get("death_date") ?? "").trim() || null;
    const bioAr = String(formData.get("bio_ar") ?? "").trim() || null;
    const bioEn = String(formData.get("bio_en") ?? "").trim() || null;
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
    const submittedBy = String(formData.get("submitted_by") ?? "").trim() || null;

    if (!nameAr) {
      return NextResponse.json(
        { success: false, error: "Arabic name is required" },
        { status: 400 }
      );
    }

    const db = await ensureMartyrsTable();
    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO martyrs (id, name_ar, name_en, birth_date, death_date, bio_ar, bio_en, image_url, status, submitted_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(
        id,
        nameAr,
        nameEn || nameAr,
        birthDate,
        deathDate,
        bioAr,
        bioEn,
        imageUrl,
        submittedBy
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/martyrs error:", err);
    const message = err instanceof Error ? err.message : "Failed to submit martyr";
    if (
      message.includes("D1 database binding") ||
      message.includes("Database") ||
      message.includes("database")
    ) {
      return NextResponse.json(
        { success: false, error: "Database connection failed. Please try again later." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
