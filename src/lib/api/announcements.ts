import { getDB } from "@/lib/db";

export type AnnouncementRow = {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  image_url: string | null;
  type: string;
  author_id: string;
  created_at: number;
};

async function ensureAnnouncementsTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS announcements (
        id TEXT NOT NULL PRIMARY KEY,
        title_ar TEXT NOT NULL,
        title_en TEXT,
        content_ar TEXT NOT NULL,
        content_en TEXT,
        image_url TEXT,
        type TEXT NOT NULL DEFAULT 'general',
        author_id TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`
    )
    .run();
  try {
    await db.prepare(`ALTER TABLE announcements ADD COLUMN image_url TEXT`).run();
  } catch {}
  try {
    await db
      .prepare(`ALTER TABLE announcements ADD COLUMN type TEXT NOT NULL DEFAULT 'general'`)
      .run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE announcements ADD COLUMN author_id TEXT`).run();
  } catch {}
  try {
    await db
      .prepare(
        `UPDATE announcements
         SET type = COALESCE(type, 'general')
         WHERE type IS NULL OR type = ''`
      )
      .run();
  } catch {}
  return db;
}

export async function getAnnouncements(limit = 20, offset = 0): Promise<AnnouncementRow[]> {
  try {
    const db = await ensureAnnouncementsTable();
    const { results } = await db
      .prepare(
        `SELECT id, title_ar, title_en, content_ar, content_en, image_url, type, author_id, created_at
         FROM announcements
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all();
    return (results ?? []) as AnnouncementRow[];
  } catch (err) {
    console.error("getAnnouncements error:", err);
    return [];
  }
}

export async function getAnnouncementById(id: string): Promise<AnnouncementRow | null> {
  if (!id) return null;
  try {
    const db = await ensureAnnouncementsTable();
    const row = await db
      .prepare(
        `SELECT id, title_ar, title_en, content_ar, content_en, image_url, type, author_id, created_at
         FROM announcements
         WHERE id = ?
         LIMIT 1`
      )
      .bind(id)
      .first<AnnouncementRow>();
    return row ?? null;
  } catch (err) {
    console.error("getAnnouncementById error:", err);
    return null;
  }
}

type CreateAnnouncementInput = {
  title_ar: string;
  title_en?: string | null;
  content_ar: string;
  content_en?: string | null;
  image_url?: string | null;
  type?: string | null;
  author_id: string;
};

export async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const titleAr = input.title_ar.trim();
  const contentAr = input.content_ar.trim();
  if (!titleAr || !contentAr) {
    return { success: false, error: "Arabic title and content are required" };
  }
  const id = crypto.randomUUID();
  const titleEn = (input.title_en ?? "").trim() || null;
  const contentEn = (input.content_en ?? "").trim() || null;
  const imageUrl = (input.image_url ?? "").trim() || null;
  const rawType = (input.type ?? "").trim().toLowerCase();
  const allowedTypes = new Set(["urgent", "obituary", "general"]);
  const type = allowedTypes.has(rawType) ? rawType : "general";

  try {
    const db = await ensureAnnouncementsTable();
    await db
      .prepare(
        `INSERT INTO announcements (
           id, title_ar, title_en, content_ar, content_en,
           image_url, type, author_id, created_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`
      )
      .bind(id, titleAr, titleEn, contentAr, contentEn, imageUrl, type, input.author_id)
      .run();
    return { success: true, id };
  } catch (err) {
    console.error("createAnnouncement error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create announcement",
    };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: true } | { success: false; error: string }> {
  if (!id) return { success: false, error: "Announcement id is required" };
  try {
    const db = await ensureAnnouncementsTable();
    await db.prepare(`DELETE FROM announcements WHERE id = ?`).bind(id).run();
    return { success: true };
  } catch (err) {
    console.error("deleteAnnouncement error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete announcement",
    };
  }
}

