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

async function ensureTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS protest_videos (
        id TEXT NOT NULL PRIMARY KEY,
        youtube_url TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        title_en TEXT,
        date TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`
    )
    .run();
  return db;
}

export async function GET() {
  try {
    await assertAdmin();
    const db = await ensureTable();
    const { results } = await db
      .prepare(
        `SELECT id, youtube_url, title_ar, title_en, date, created_at
         FROM protest_videos ORDER BY created_at DESC`
      )
      .all();
    return NextResponse.json({ videos: results ?? [] });
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
      youtube_url?: string;
      title_ar?: string;
      title_en?: string;
      date?: string;
    };
    const youtubeUrl = (body.youtube_url ?? "").trim();
    const titleAr = (body.title_ar ?? "").trim();
    const titleEn = (body.title_en ?? "").trim() || null;
    const date = (body.date ?? "").trim() || null;

    if (!youtubeUrl) return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    if (!titleAr) return NextResponse.json({ error: "Arabic title is required" }, { status: 400 });

    const db = await ensureTable();
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO protest_videos (id, youtube_url, title_ar, title_en, date) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, youtubeUrl, titleAr, titleEn, date)
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
      youtube_url?: string;
      title_ar?: string;
      title_en?: string;
      date?: string;
    };
    const id = (body.id ?? "").trim();
    const youtubeUrl = (body.youtube_url ?? "").trim();
    const titleAr = (body.title_ar ?? "").trim();
    const titleEn = (body.title_en ?? "").trim() || null;
    const date = (body.date ?? "").trim() || null;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    if (!youtubeUrl) return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    if (!titleAr) return NextResponse.json({ error: "Arabic title is required" }, { status: 400 });

    const db = await ensureTable();
    await db
      .prepare(
        `UPDATE protest_videos SET youtube_url = ?, title_ar = ?, title_en = ?, date = ? WHERE id = ?`
      )
      .bind(youtubeUrl, titleAr, titleEn, date, id)
      .run();

    revalidatePath("/[locale]/revolution", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await assertAdmin();
    const { id } = (await request.json()) as { id?: string };
    const videoId = (id ?? "").trim();
    if (!videoId) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const db = await ensureTable();
    await db.prepare(`DELETE FROM protest_videos WHERE id = ?`).bind(videoId).run();

    revalidatePath("/[locale]/revolution", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
