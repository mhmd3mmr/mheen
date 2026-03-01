export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDB } from "@/lib/db";
import { z } from "zod";

type R2Bucket = {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string } }
  ) => Promise<void>;
};

function getBucket(): R2Bucket | null {
  try {
    const ctx = getRequestContext();
    const env = (ctx as unknown as { env?: { BUCKET?: R2Bucket } }).env;
    if (env?.BUCKET) return env.BUCKET;
  } catch {}

  const proc = process.env as Record<string, unknown>;
  return (proc.BUCKET as R2Bucket | undefined) ?? null;
}

const StoryCategoryValues = ["history", "memories", "figures", "other"] as const;
const storySubmitSchema = z.object({
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = storySubmitSchema.safeParse({
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
    let imageUrl = String(formData.get("image_url") ?? "").trim() || null;
    const file = formData.get("file");

    // If a file is sent directly, upload it to R2 from this endpoint.
    if (file instanceof File) {
      const bucket = getBucket();
      if (!bucket) {
        return NextResponse.json(
          { success: false, error: "Upload not available (R2 not configured)" },
          { status: 501 }
        );
      }
      const ext = file.name.replace(/^.*\./, "").toLowerCase() || "webp";
      const key = `stories/${crypto.randomUUID()}.${ext}`;
      const buffer = await file.arrayBuffer();
      await bucket.put(key, buffer, {
        httpMetadata: { contentType: file.type || "image/webp" },
      });
      const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
      imageUrl = base ? `${base.replace(/\/$/, "")}/${key}` : key;
    }

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
    const message = err instanceof Error ? err.message : "Failed to submit story";
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
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
