export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

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

    const db = await getDB();
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
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to submit martyr",
      },
      { status: 500 }
    );
  }
}
