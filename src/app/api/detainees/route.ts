export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

async function ensureDetaineesTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS detainees (
        id TEXT NOT NULL PRIMARY KEY,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        arrest_date TEXT,
        status_ar TEXT,
        status_en TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'approved',
        submitted_by TEXT
      )`
    )
    .run();

  // Backward-compatible migration for older production DBs.
  try {
    await db.prepare(`ALTER TABLE detainees ADD COLUMN arrest_date TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE detainees ADD COLUMN status_ar TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE detainees ADD COLUMN status_en TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE detainees ADD COLUMN image_url TEXT`).run();
  } catch {}
  try {
    await db
      .prepare(`ALTER TABLE detainees ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'`)
      .run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE detainees ADD COLUMN submitted_by TEXT`).run();
  } catch {}

  return db;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nameAr = String(formData.get("name_ar") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    const arrestDate = String(formData.get("arrest_date") ?? "").trim() || null;
    const statusAr = String(formData.get("status_ar") ?? "").trim() || null;
    const statusEn = String(formData.get("status_en") ?? "").trim() || null;
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
    const submittedBy = String(formData.get("submitted_by") ?? "").trim() || null;

    if (!nameAr) {
      return NextResponse.json(
        { success: false, error: "Arabic name is required" },
        { status: 400 }
      );
    }

    const db = await ensureDetaineesTable();
    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO detainees (id, name_ar, name_en, arrest_date, status_ar, status_en, image_url, status, submitted_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(id, nameAr, nameEn || nameAr, arrestDate, statusAr, statusEn, imageUrl, submittedBy)
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/detainees error:", err);
    const message = err instanceof Error ? err.message : "Failed to submit detainee";
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
