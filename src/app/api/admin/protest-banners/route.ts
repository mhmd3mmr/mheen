export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { extractR2KeyFromImageUrl, getR2Bucket } from "@/lib/r2";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

async function ensureTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS protest_banners (
        id TEXT NOT NULL PRIMARY KEY,
        image_url TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        description_en TEXT,
        date TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`
    )
    .run();
  try {
    await db.prepare(`ALTER TABLE protest_banners ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`).run();
  } catch {}
  try {
    await db
      .prepare(
        `WITH ranked AS (
           SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
           FROM protest_banners
         )
         UPDATE protest_banners
         SET sort_order = (
           SELECT rn FROM ranked WHERE ranked.id = protest_banners.id
         )
         WHERE COALESCE(sort_order, 0) = 0`
      )
      .run();
  } catch {}
  return db;
}

export async function GET() {
  try {
    await assertAdmin();
    const db = await ensureTable();
    const { results } = await db
      .prepare(
        `SELECT id, image_url, description_ar, description_en, date, sort_order, created_at
         FROM protest_banners ORDER BY sort_order ASC, created_at DESC`
      )
      .all();
    return NextResponse.json({ banners: results ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await assertAdmin();
    const body = (await request.json()) as {
      image_url?: string;
      description_ar?: string;
      description_en?: string;
      date?: string;
    };
    const imageUrl = (body.image_url ?? "").trim();
    const descAr = (body.description_ar ?? "").trim();
    const descEn = (body.description_en ?? "").trim() || null;
    const date = (body.date ?? "").trim() || null;

    if (!imageUrl) return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    if (!descAr) return NextResponse.json({ error: "Arabic description is required" }, { status: 400 });

    const db = await ensureTable();
    const id = crypto.randomUUID();
    const nextOrderRow = await db
      .prepare(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM protest_banners`)
      .first<{ next_order: number }>();
    const nextOrder = Number(nextOrderRow?.next_order ?? 1);

    await db
      .prepare(
        `INSERT INTO protest_banners (id, image_url, description_ar, description_en, date, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, imageUrl, descAr, descEn, date, nextOrder)
      .run();

    revalidatePath("/[locale]/revolution", "page");
    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    await assertAdmin();
    const body = (await request.json()) as {
      id?: string;
      image_url?: string;
      description_ar?: string;
      description_en?: string;
      date?: string;
    };
    const id = (body.id ?? "").trim();
    const imageUrl = (body.image_url ?? "").trim();
    const descAr = (body.description_ar ?? "").trim();
    const descEn = (body.description_en ?? "").trim() || null;
    const date = (body.date ?? "").trim() || null;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    if (!imageUrl) return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    if (!descAr) return NextResponse.json({ error: "Arabic description is required" }, { status: 400 });

    const db = await ensureTable();
    await db
      .prepare(
        `UPDATE protest_banners SET image_url = ?, description_ar = ?, description_en = ?, date = ? WHERE id = ?`
      )
      .bind(imageUrl, descAr, descEn, date, id)
      .run();

    revalidatePath("/[locale]/revolution", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await assertAdmin();
    const body = (await request.json()) as { ordered_ids?: string[] };
    const orderedIds = Array.isArray(body.ordered_ids)
      ? body.ordered_ids.map((id) => String(id ?? "").trim()).filter(Boolean)
      : [];
    if (orderedIds.length === 0) {
      return NextResponse.json({ error: "ordered_ids is required" }, { status: 400 });
    }

    const db = await ensureTable();
    for (let i = 0; i < orderedIds.length; i += 1) {
      await db
        .prepare(`UPDATE protest_banners SET sort_order = ? WHERE id = ?`)
        .bind(i + 1, orderedIds[i])
        .run();
    }

    revalidatePath("/[locale]/revolution", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reorder";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await assertAdmin();
    const { id } = (await request.json()) as { id?: string };
    const bannerId = (id ?? "").trim();
    if (!bannerId) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const db = await ensureTable();
    const row = await db
      .prepare(`SELECT image_url FROM protest_banners WHERE id = ?`)
      .bind(bannerId)
      .first<{ image_url: string | null }>();

    await db.prepare(`DELETE FROM protest_banners WHERE id = ?`).bind(bannerId).run();

    const key = extractR2KeyFromImageUrl(row?.image_url ?? "");
    const bucket = getR2Bucket();
    if (key && bucket?.delete) {
      try { await bucket.delete(key); } catch {}
    }

    revalidatePath("/[locale]/revolution", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
