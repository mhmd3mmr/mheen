export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { z } from "zod";

const StoryCategoryValues = ["history", "memories", "figures", "other"] as const;
const storySchema = z.object({
  author_ar: z.string().trim().min(1),
  author_en: z.string().trim().min(1),
  content_ar: z.string().trim().min(1),
  content_en: z.string().trim().min(1),
  title_ar: z.string().trim().min(1),
  title_en: z.string().trim().min(1),
  category: z.enum(StoryCategoryValues),
  tags: z.string().trim().optional(),
  image_url: z.string().trim().optional(),
});

async function ensureStoryColumns() {
  const db = await getDB();
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN title_ar TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN title_en TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN category TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN author_ar TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN author_en TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN content_ar TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN content_en TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE stories ADD COLUMN tags TEXT`).run();
  } catch {}
  return db;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawPage = Number(url.searchParams.get("page") ?? "1");
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = 24;
    const offset = (page - 1) * limit;

    const db = await ensureStoryColumns();
    const [{ results }, totalRes] = await Promise.all([
      db
        .prepare(
          `SELECT id, author_name, author_ar, author_en, title_ar, title_en, category,
                  content, content_ar, content_en, tags, image_url, created_at
           FROM stories
           WHERE status = 'approved'
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`
        )
        .bind(limit, offset)
        .all(),
      db
        .prepare(`SELECT COUNT(*) AS total FROM stories WHERE status = 'approved'`)
        .first<{ total: number }>(),
    ]);

    const stories = (results ?? []) as Array<{
      id: string;
      author_name: string;
      content: string;
      image_url: string | null;
      created_at: number;
    }>;
    const total = Number(totalRes?.total ?? 0);
    const hasMore = offset + stories.length < total;

    return NextResponse.json({ stories, page, limit, hasMore, total });
  } catch (err) {
    console.error("GET /api/stories error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load stories",
        stories: [],
        hasMore: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = storySchema.safeParse({
      author_ar: String(formData.get("author_ar") ?? ""),
      author_en: String(formData.get("author_en") ?? ""),
      content_ar: String(formData.get("content_ar") ?? ""),
      content_en: String(formData.get("content_en") ?? ""),
      title_ar: String(formData.get("title_ar") ?? ""),
      title_en: String(formData.get("title_en") ?? ""),
      category: String(formData.get("category") ?? ""),
      tags: String(formData.get("tags") ?? ""),
      image_url: String(formData.get("image_url") ?? ""),
    });
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Arabic/English author, title, and content are required, plus category",
        },
        { status: 400 }
      );
    }
    const {
      author_ar: authorAr,
      author_en: authorEn,
      content_ar: contentAr,
      content_en: contentEn,
      title_ar: titleAr,
      title_en: titleEn,
      category,
      tags,
    } = parsed.data;
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

    const db = await ensureStoryColumns();
    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO stories (
           id, author_name, author_ar, author_en, title_ar, title_en, category,
           content, content_ar, content_en, tags, image_url, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      )
      .bind(
        id,
        authorAr,
        authorAr,
        authorEn,
        titleAr,
        titleEn,
        category,
        contentAr,
        contentAr,
        contentEn,
        tags || null,
        imageUrl
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/stories error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to submit story",
      },
      { status: 500 }
    );
  }
}
