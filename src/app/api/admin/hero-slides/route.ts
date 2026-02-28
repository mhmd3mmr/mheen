export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

async function ensureHeroSlidesTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS hero_slides (
        id TEXT NOT NULL PRIMARY KEY,
        image_url TEXT NOT NULL,
        title_ar TEXT,
        title_en TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`
    )
    .run();
  return db;
}

export async function GET() {
  try {
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const { results } = await db
      .prepare(
        `SELECT id, image_url, title_ar, title_en, is_active, sort_order, created_at, updated_at
         FROM hero_slides
         ORDER BY sort_order ASC, created_at DESC`
      )
      .all();
    return NextResponse.json({ slides: results ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load slides";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const body = (await request.json()) as {
      image_url?: string;
      title_ar?: string;
      title_en?: string;
      is_active?: boolean;
      sort_order?: number;
    };
    const imageUrl = String(body.image_url ?? "").trim();
    const titleAr = String(body.title_ar ?? "").trim() || null;
    const titleEn = String(body.title_en ?? "").trim() || null;
    const isActive = body.is_active === false ? 0 : 1;
    const sortOrder = Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO hero_slides (id, image_url, title_ar, title_en, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, imageUrl, titleAr, titleEn, isActive, sortOrder)
      .run();

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin/hero-slides", "page");
    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add slide";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const body = (await request.json()) as {
      id?: string;
      image_url?: string;
      title_ar?: string;
      title_en?: string;
      is_active?: boolean;
      sort_order?: number;
    };
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Slide id is required" }, { status: 400 });
    }

    const imageUrl = String(body.image_url ?? "").trim();
    const titleAr = String(body.title_ar ?? "").trim() || null;
    const titleEn = String(body.title_en ?? "").trim() || null;
    const isActive = body.is_active === false ? 0 : 1;
    const sortOrder = Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    await db
      .prepare(
        `UPDATE hero_slides
         SET image_url = ?, title_ar = ?, title_en = ?, is_active = ?, sort_order = ?, updated_at = unixepoch()
         WHERE id = ?`
      )
      .bind(imageUrl, titleAr, titleEn, isActive, sortOrder, id)
      .run();

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin/hero-slides", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update slide";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const { id } = (await request.json()) as { id?: string };
    const slideId = String(id ?? "").trim();
    if (!slideId) {
      return NextResponse.json({ error: "Slide id is required" }, { status: 400 });
    }

    await db.prepare(`DELETE FROM hero_slides WHERE id = ?`).bind(slideId).run();
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin/hero-slides", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete slide";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
