export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

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

    const db = await getDB();
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
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to submit detainee",
      },
      { status: 500 }
    );
  }
}
