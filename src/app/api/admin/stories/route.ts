export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getDB } from "@/lib/db";
import { extractR2KeyFromImageUrl, getR2Bucket } from "@/lib/r2";
import { z } from "zod";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

async function deleteStoryImageFromR2(imageUrl: string | null | undefined) {
  const key = extractR2KeyFromImageUrl((imageUrl ?? "").trim());
  const bucket = getR2Bucket();
  if (!key || !bucket?.delete) return;
  try {
    await bucket.delete(key);
  } catch {}
}

const StoryCategoryValues = ["history", "memories", "figures", "other"] as const;
const updateStorySchema = z.object({
  id: z.string().trim().min(1),
  title_ar: z.string().trim().min(1),
  title_en: z.string().trim().min(1),
  author_ar: z.string().trim().min(1),
  author_en: z.string().trim().min(1),
  content_ar: z.string().trim().min(1),
  content_en: z.string().trim().min(1),
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

export async function PUT(request: Request) {
  // approve story
  try {
    await assertAdmin();
    const { id } = (await request.json()) as { id?: string };
    const storyId = String(id ?? "").trim();
    if (!storyId) {
      return NextResponse.json({ success: false, error: "Story id is required" }, { status: 400 });
    }

    const db = await ensureStoryColumns();
    await db.prepare(`UPDATE stories SET status = 'approved' WHERE id = ?`).bind(storyId).run();

    revalidatePath("/[locale]/admin/stories", "page");
    revalidatePath("/[locale]/stories", "page");
    revalidatePath("/[locale]", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to approve story";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  // update story
  try {
    await assertAdmin();
    const payload = await request.json();
    const parsed = updateStorySchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "All bilingual fields are required (title, author, content) plus category",
        },
        { status: 400 }
      );
    }
    const { id, title_ar, title_en, author_ar, author_en, content_ar, content_en, category, tags } =
      parsed.data;
    const imageUrl = String(parsed.data.image_url ?? "").trim() || null;

    const db = await ensureStoryColumns();
    const existing = await db
      .prepare(`SELECT image_url FROM stories WHERE id = ?`)
      .bind(id)
      .first<{ image_url: string | null }>();
    await db
      .prepare(`UPDATE stories SET author_name = ?, content = ? WHERE id = ?`)
      .bind(author_ar, content_ar, id)
      .run();
    await db
      .prepare(
        `UPDATE stories
         SET title_ar = ?, title_en = ?, author_ar = ?, author_en = ?, category = ?,
             content_ar = ?, content_en = ?, tags = ?, image_url = COALESCE(?, image_url)
         WHERE id = ?`
      )
      .bind(
        title_ar,
        title_en,
        author_ar,
        author_en,
        category,
        content_ar,
        content_en,
        tags || null,
        imageUrl,
        id
      )
      .run();
    if (imageUrl && existing?.image_url && existing.image_url !== imageUrl) {
      await deleteStoryImageFromR2(existing.image_url);
    }

    revalidatePath("/[locale]/admin/stories", "page");
    revalidatePath("/[locale]/stories", "page");
    revalidatePath("/[locale]", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update story";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  // delete story
  try {
    await assertAdmin();
    const { id } = (await request.json()) as { id?: string };
    const storyId = String(id ?? "").trim();
    if (!storyId) {
      return NextResponse.json({ success: false, error: "Story id is required" }, { status: 400 });
    }

    const db = await getDB();
    const row = await db
      .prepare(`SELECT image_url FROM stories WHERE id = ?`)
      .bind(storyId)
      .first<{ image_url: string | null }>();

    await db.prepare(`DELETE FROM stories WHERE id = ?`).bind(storyId).run();
    await deleteStoryImageFromR2(row?.image_url);

    revalidatePath("/[locale]/admin/stories", "page");
    revalidatePath("/[locale]/stories", "page");
    revalidatePath("/[locale]", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete story";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
