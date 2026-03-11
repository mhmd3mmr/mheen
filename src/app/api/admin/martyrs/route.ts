export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { extractR2KeyFromImageUrl, getR2Bucket } from "@/lib/r2";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

async function tryDeleteImage(imageUrl: string | null | undefined) {
  const key = extractR2KeyFromImageUrl((imageUrl ?? "").trim());
  const bucket = getR2Bucket();
  if (!key || !bucket?.delete) return;
  try {
    await bucket.delete(key);
  } catch {}
}

const martyrdomMethods = ["combatant", "detained_then_martyred", "civilian_bombing", "other"] as const;

export async function PATCH(request: Request) {
  try {
    await assertAdmin();
    const payload = (await request.json()) as {
      id?: string;
      name_ar?: string;
      name_en?: string;
      birth_date?: string | null;
      death_date?: string | null;
      martyrdom_method?: string;
      martyrdom_details?: string | null;
      tags?: string | null;
      image_url?: string | null;
      preview_image_url?: string | null;
    };

    const id = String(payload.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Martyr id is required" }, { status: 400 });
    }

    const nameAr = String(payload.name_ar ?? "").trim();
    const nameEn = String(payload.name_en ?? "").trim();
    if (!nameAr || !nameEn) {
      return NextResponse.json(
        { success: false, error: "Arabic and English names are required" },
        { status: 400 }
      );
    }

    const martyrdomMethod = String(payload.martyrdom_method ?? "").trim() || null;
    if (martyrdomMethod && !martyrdomMethods.includes(martyrdomMethod as (typeof martyrdomMethods)[number])) {
      return NextResponse.json(
        { success: false, error: "Invalid martyrdom method" },
        { status: 400 }
      );
    }
    if (martyrdomMethod === "other" && !String(payload.martyrdom_details ?? "").trim()) {
      return NextResponse.json(
        { success: false, error: "Martyrdom details are required for 'other'" },
        { status: 400 }
      );
    }

    const birthDate = String(payload.birth_date ?? "").trim() || null;
    const deathDate = String(payload.death_date ?? "").trim() || null;
    const martyrdomDetails = String(payload.martyrdom_details ?? "").trim() || null;
    const tags = String(payload.tags ?? "").trim() || null;
    const imageUrl = String(payload.image_url ?? "").trim() || null;
    const previewImageUrl = String(payload.preview_image_url ?? "").trim() || null;

    const db = await getDB();
    // Backward-compatible migration for older production DBs.
    try {
      await db.prepare(`ALTER TABLE martyrs ADD COLUMN preview_image_url TEXT`).run();
    } catch {}
    const existing = await db
      .prepare(`SELECT image_url, preview_image_url FROM martyrs WHERE id = ?`)
      .bind(id)
      .first<{ image_url: string | null; preview_image_url?: string | null }>();

    if (!existing) {
      return NextResponse.json({ success: false, error: "Martyr not found" }, { status: 404 });
    }

    await db
      .prepare(
        `UPDATE martyrs SET
          name_ar = ?, name_en = ?, birth_date = ?, death_date = ?,
          martyrdom_method = ?, martyrdom_details = ?, tags = ?,
          image_url = COALESCE(?, image_url),
          preview_image_url = COALESCE(?, preview_image_url)
         WHERE id = ?`
      )
      .bind(
        nameAr,
        nameEn,
        birthDate,
        deathDate,
        martyrdomMethod,
        martyrdomDetails,
        tags,
        imageUrl,
        previewImageUrl,
        id
      )
      .run();

    if (imageUrl && existing?.image_url && existing.image_url !== imageUrl) {
      await tryDeleteImage(existing.image_url);
    }
    if (previewImageUrl && existing?.preview_image_url && existing.preview_image_url !== previewImageUrl) {
      await tryDeleteImage(existing.preview_image_url);
    }

    revalidatePath("/[locale]/admin/record-of-honor", "page");
    revalidatePath("/[locale]/martyrs", "page");
    revalidatePath("/[locale]/record-of-honor", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update martyr";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
