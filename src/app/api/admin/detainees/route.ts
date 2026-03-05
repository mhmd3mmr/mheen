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

export async function PATCH(request: Request) {
  try {
    await assertAdmin();
    const payload = (await request.json()) as {
      id?: string;
      name_ar?: string;
      name_en?: string;
      arrest_date?: string | null;
      status_ar?: string | null;
      status_en?: string | null;
      tags?: string | null;
      image_url?: string | null;
    };

    const id = String(payload.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Detainee id is required" }, { status: 400 });
    }

    const nameAr = String(payload.name_ar ?? "").trim();
    const nameEn = String(payload.name_en ?? "").trim();
    if (!nameAr || !nameEn) {
      return NextResponse.json(
        { success: false, error: "Arabic and English names are required" },
        { status: 400 }
      );
    }

    const arrestDate = String(payload.arrest_date ?? "").trim() || null;
    const statusAr = String(payload.status_ar ?? "").trim() || null;
    const statusEn = String(payload.status_en ?? "").trim() || null;
    const tags = String(payload.tags ?? "").trim() || null;
    const imageUrl = String(payload.image_url ?? "").trim() || null;

    const db = await getDB();
    const existing = await db
      .prepare(`SELECT image_url FROM detainees WHERE id = ?`)
      .bind(id)
      .first<{ image_url: string | null }>();

    if (!existing) {
      return NextResponse.json({ success: false, error: "Detainee not found" }, { status: 404 });
    }

    await db
      .prepare(
        `UPDATE detainees SET
          name_ar = ?, name_en = ?, arrest_date = ?, status_ar = ?, status_en = ?,
          tags = ?, image_url = COALESCE(?, image_url)
         WHERE id = ?`
      )
      .bind(nameAr, nameEn, arrestDate, statusAr, statusEn, tags, imageUrl, id)
      .run();

    if (imageUrl && existing?.image_url && existing.image_url !== imageUrl) {
      await tryDeleteImage(existing.image_url);
    }

    revalidatePath("/[locale]/admin/record-of-honor", "page");
    revalidatePath("/[locale]/detainees", "page");
    revalidatePath("/[locale]/record-of-honor", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update detainee";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
