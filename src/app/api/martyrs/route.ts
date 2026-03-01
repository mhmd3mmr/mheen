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
        martyrdom_method TEXT,
        martyrdom_details TEXT,
        tags TEXT,
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
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN image_url TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN martyrdom_method TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN martyrdom_details TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE martyrs ADD COLUMN tags TEXT`).run();
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
    const martyrdomMethod = String(formData.get("martyrdom_method") ?? "").trim() || null;
    const martyrdomDetails = String(formData.get("martyrdom_details") ?? "").trim() || null;
    const tags = String(formData.get("tags") ?? "").trim() || null;
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
    const submittedBy = String(formData.get("submitted_by") ?? "").trim() || null;
    const requestedStatus = String(formData.get("desired_status") ?? "").trim();

    if (!nameAr) {
      return NextResponse.json(
        { success: false, error: "Arabic name is required" },
        { status: 400 }
      );
    }
    if (!martyrdomMethod) {
      return NextResponse.json(
        { success: false, error: "Martyrdom method is required" },
        { status: 400 }
      );
    }
    if (
      !["combatant", "detained_then_martyred", "civilian_bombing", "other"].includes(
        martyrdomMethod
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid martyrdom method" },
        { status: 400 }
      );
    }
    if (martyrdomMethod === "other" && !martyrdomDetails) {
      return NextResponse.json(
        { success: false, error: "Martyrdom details are required for 'other'" },
        { status: 400 }
      );
    }

    const db = await ensureMartyrsTable();
    const id = crypto.randomUUID();
    let status = "pending";

    if (requestedStatus === "approved") {
      // Admin-only shortcut used by admin panel additions.
      const { auth } = await import("@/auth");
      const session = await auth();
      const role = (session?.user as { role?: string } | null)?.role;
      if (role === "admin") status = "approved";
    }

    await db
      .prepare(
        `INSERT INTO martyrs (
           id, name_ar, name_en, birth_date, death_date,
           martyrdom_method, martyrdom_details, tags, image_url, status, submitted_by
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        nameAr,
        nameEn || nameAr,
        birthDate,
        deathDate,
        martyrdomMethod,
        martyrdomDetails,
        tags,
        imageUrl,
        status,
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
