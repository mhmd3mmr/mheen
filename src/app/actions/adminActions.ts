"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { extractR2KeyFromImageUrl, getR2Bucket } from "@/lib/r2";

/**
 * Ensure the current user is authenticated and has the `admin` role.
 * All admin server actions MUST call this first.
 */
async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function tryDeleteImageFromR2(imageUrl: string | null | undefined, context: string) {
  const normalized = (imageUrl ?? "").trim();
  if (!normalized) return;
  const key = extractR2KeyFromImageUrl(normalized);
  const bucket = getR2Bucket();
  if (!key || !bucket?.delete) return;
  try {
    await bucket.delete(key);
  } catch (err) {
    console.warn(`${context}: R2 delete failed for key`, key, err);
  }
}

// ---------------------------------------------------------------------------
// Martyrs
// ---------------------------------------------------------------------------

export type MartyrRow = {
  id: string;
  name_ar: string;
  name_en: string;
  birth_date: string | null;
  death_date: string | null;
  martyrdom_method: string | null;
  martyrdom_details: string | null;
  tags: string | null;
  image_url: string | null;
  status: string;
  submitted_by: string | null;
};

export async function getMartyrs(): Promise<MartyrRow[]> {
  await assertAdmin();
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, name_ar, name_en, birth_date, death_date, martyrdom_method, martyrdom_details, tags, image_url, status, submitted_by
         FROM martyrs
         ORDER BY status ASC, death_date DESC, name_en ASC`
      )
      .all();
    return (results ?? []) as MartyrRow[];
  } catch (error) {
    console.warn("getMartyrs: D1 not available, returning empty list.");
    return [];
  }
}

export async function getPendingMartyrs(): Promise<MartyrRow[]> {
  await assertAdmin();
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, name_ar, name_en, birth_date, death_date, martyrdom_method, martyrdom_details, tags, image_url, status, submitted_by
         FROM martyrs WHERE status = 'pending'
         ORDER BY name_en ASC`
      )
      .all();
    return (results ?? []) as MartyrRow[];
  } catch {
    return [];
  }
}

export async function approveMartyr(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Martyr id is required");
  await db.prepare(`UPDATE martyrs SET status = 'approved' WHERE id = ?`).bind(id).run();
  revalidatePath("/[locale]/admin/martyrs", "page");
  revalidatePath("/[locale]/admin/record-of-honor", "page");
  revalidatePath("/[locale]/martyrs", "page");
}

export async function addMartyr(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await assertAdmin();
    const db = await getDB();

    const id = crypto.randomUUID();
    const nameAr = String(formData.get("name_ar") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    const birthDate = String(formData.get("birth_date") ?? "").trim() || null;
    const deathDate = String(formData.get("death_date") ?? "").trim() || null;
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

    if (!nameAr || !nameEn) {
      return { success: false, error: "Name (Arabic and English) is required" };
    }

    await db
      .prepare(
        `INSERT INTO martyrs
         (id, name_ar, name_en, birth_date, death_date, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, 'approved')`
      )
      .bind(id, nameAr, nameEn, birthDate, deathDate, imageUrl)
      .run();

    revalidatePath("/[locale]/admin/martyrs", "page");
    revalidatePath("/[locale]/admin/record-of-honor", "page");
    revalidatePath("/[locale]/martyrs", "page");
    return { success: true };
  } catch (err) {
    console.error("addMartyr error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to add martyr" };
  }
}

export async function deleteMartyr(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Martyr id is required");

  const row = await db
    .prepare(`SELECT image_url FROM martyrs WHERE id = ?`)
    .bind(id)
    .first<{ image_url: string | null }>();

  await db.prepare(`DELETE FROM martyrs WHERE id = ?`).bind(id).run();
  await tryDeleteImageFromR2(row?.image_url, "deleteMartyr");
  revalidatePath("/[locale]/admin/martyrs", "page");
  revalidatePath("/[locale]/admin/record-of-honor", "page");
  revalidatePath("/[locale]/martyrs", "page");
}

// ---------------------------------------------------------------------------
// Detainees
// ---------------------------------------------------------------------------

export type DetaineeRow = {
  id: string;
  name_ar: string;
  name_en: string;
  arrest_date: string | null;
  status_ar: string | null;
  status_en: string | null;
  tags: string | null;
  image_url: string | null;
  status: string;
  submitted_by: string | null;
};

export async function getDetainees(): Promise<DetaineeRow[]> {
  await assertAdmin();
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, name_ar, name_en, arrest_date, status_ar, status_en, tags, image_url, status, submitted_by
         FROM detainees
         ORDER BY status ASC, arrest_date DESC, name_en ASC`
      )
      .all();
    return (results ?? []) as DetaineeRow[];
  } catch (error) {
    console.warn("getDetainees: D1 not available, returning empty list.");
    return [];
  }
}

export async function getPendingDetainees(): Promise<DetaineeRow[]> {
  await assertAdmin();
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, name_ar, name_en, arrest_date, status_ar, status_en, tags, image_url, status, submitted_by
         FROM detainees WHERE status = 'pending'
         ORDER BY name_en ASC`
      )
      .all();
    return (results ?? []) as DetaineeRow[];
  } catch {
    return [];
  }
}

export async function approveDetainee(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Detainee id is required");
  await db.prepare(`UPDATE detainees SET status = 'approved' WHERE id = ?`).bind(id).run();
  revalidatePath("/[locale]/admin/detainees", "page");
  revalidatePath("/[locale]/admin/record-of-honor", "page");
  revalidatePath("/[locale]/detainees", "page");
}

export async function addDetainee(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await assertAdmin();
    const db = await getDB();

    const id = crypto.randomUUID();
    const nameAr = String(formData.get("name_ar") ?? "").trim();
    const nameEn = String(formData.get("name_en") ?? "").trim();
    const arrestDate = String(formData.get("arrest_date") ?? "").trim() || null;
    const statusAr = String(formData.get("status_ar") ?? "").trim() || null;
    const statusEn = String(formData.get("status_en") ?? "").trim() || null;
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

    if (!nameAr || !nameEn) {
      return { success: false, error: "Name (Arabic and English) is required" };
    }

    await db
      .prepare(
        `INSERT INTO detainees
         (id, name_ar, name_en, arrest_date, status_ar, status_en, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')`
      )
      .bind(id, nameAr, nameEn, arrestDate, statusAr, statusEn, imageUrl)
      .run();

    revalidatePath("/[locale]/admin/detainees", "page");
    revalidatePath("/[locale]/admin/record-of-honor", "page");
    revalidatePath("/[locale]/detainees", "page");
    return { success: true };
  } catch (err) {
    console.error("addDetainee error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to add detainee" };
  }
}

export async function deleteDetainee(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Detainee id is required");

  const row = await db
    .prepare(`SELECT image_url FROM detainees WHERE id = ?`)
    .bind(id)
    .first<{ image_url: string | null }>();

  await db.prepare(`DELETE FROM detainees WHERE id = ?`).bind(id).run();
  await tryDeleteImageFromR2(row?.image_url, "deleteDetainee");
  revalidatePath("/[locale]/admin/detainees", "page");
  revalidatePath("/[locale]/admin/record-of-honor", "page");
  revalidatePath("/[locale]/detainees", "page");
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export type StoryRow = {
  id: string;
  author_name: string;
  author_ar: string | null;
  author_en: string | null;
  title_ar: string | null;
  title_en: string | null;
  category: string | null;
  content: string;
  content_ar: string | null;
  content_en: string | null;
  tags: string | null;
  image_url: string | null;
  status: string;
  created_at: number;
};

export async function getAllStories(): Promise<StoryRow[]> {
  await assertAdmin();
  try {
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
    const { results } = await db
      .prepare(
        `SELECT id, author_name, author_ar, author_en, title_ar, title_en, category,
                content, content_ar, content_en, tags, image_url, status, created_at
         FROM stories
         ORDER BY created_at DESC`
      )
      .all();
    return (results ?? []) as StoryRow[];
  } catch (error) {
    console.warn("getAllStories: D1 not available, returning empty list.");
    return [];
  }
}

export async function getPendingStories(): Promise<StoryRow[]> {
  await assertAdmin();
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, author_name, author_ar, author_en, title_ar, title_en, category,
                content, content_ar, content_en, tags, image_url, status, created_at
         FROM stories
         WHERE status = 'pending'
         ORDER BY created_at DESC`
      )
      .all();
    return (results ?? []) as StoryRow[];
  } catch (error) {
    console.warn("getPendingStories: D1 not available, returning empty list.");
    return [];
  }
}

export async function approveStory(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Story id is required");

  await db
    .prepare(`UPDATE stories SET status = 'approved' WHERE id = ?`)
    .bind(id)
    .run();

  revalidatePath("/[locale]/admin/stories", "page");
  revalidatePath("/[locale]/stories", "page");
  revalidatePath("/[locale]", "page");
}

export async function updateStory(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await assertAdmin();
    const db = await getDB();

    const id = String(formData.get("id") ?? "").trim();
    const authorName = String(formData.get("author_name") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();

    if (!id) return { success: false, error: "Story id is required" };
    if (!authorName || !content) {
      return { success: false, error: "Author name and content are required" };
    }

    await db
      .prepare(
        `UPDATE stories SET author_name = ?, content = ? WHERE id = ?`
      )
      .bind(authorName, content, id)
      .run();

    revalidatePath("/[locale]/admin/stories", "page");
    revalidatePath("/[locale]/stories", "page");
    revalidatePath("/[locale]", "page");
    return { success: true };
  } catch (err) {
    console.error("updateStory error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update story" };
  }
}

export async function deleteStory(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Story id is required");

  const row = await db
    .prepare(`SELECT image_url FROM stories WHERE id = ?`)
    .bind(id)
    .first<{ image_url: string | null }>();

  await db.prepare(`DELETE FROM stories WHERE id = ?`).bind(id).run();
  await tryDeleteImageFromR2(row?.image_url, "deleteStory");

  revalidatePath("/[locale]/admin/stories", "page");
  revalidatePath("/[locale]/stories", "page");
  revalidatePath("/[locale]", "page");
}

// ---------------------------------------------------------------------------
// Users (admin only)
// ---------------------------------------------------------------------------

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

export async function getUsers(): Promise<UserRow[]> {
  await assertAdmin();
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT
           u.id,
           u.name,
           u.email,
           u.image,
           u.role
         FROM users u
         WHERE u.email IS NOT NULL
           AND u.id = (
             SELECT u2.id
             FROM users u2
             WHERE lower(u2.email) = lower(u.email)
             ORDER BY u2.id ASC
             LIMIT 1
           )
         ORDER BY lower(u.email) ASC`
      )
      .all();
    return (results ?? []) as UserRow[];
  } catch (error) {
    console.warn("getUsers: D1 not available, returning empty list.");
    return [];
  }
}

export async function updateUserRole(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await assertAdmin();
    const db = await getDB();

    const id = String(formData.get("id") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();

    if (!id) return { success: false, error: "User id is required" };
    if (!["admin", "contributor", "public"].includes(role)) {
      return { success: false, error: "Invalid role" };
    }

    await db.prepare(`UPDATE users SET role = ? WHERE id = ?`).bind(role, id).run();

    revalidatePath("/[locale]/admin/users", "page");
    return { success: true };
  } catch (err) {
    console.error("updateUserRole error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update role" };
  }
}

// ---------------------------------------------------------------------------
// Community photos (admin only)
// ---------------------------------------------------------------------------

export type CommunityPhotoRow = {
  id: string;
  title: string;
  title_ar: string | null;
  title_en: string | null;
  image_url: string;
  status: string;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  created_at: number;
  updated_at: number;
};

export async function getAllCommunityPhotos(): Promise<CommunityPhotoRow[]> {
  await assertAdmin();
  try {
    const db = await getDB();
    try {
      await db.prepare(`ALTER TABLE community_photos ADD COLUMN title_ar TEXT`).run();
    } catch {}
    try {
      await db.prepare(`ALTER TABLE community_photos ADD COLUMN title_en TEXT`).run();
    } catch {}
    try {
      await db
        .prepare(
          `UPDATE community_photos
           SET title_ar = COALESCE(title_ar, title),
               title_en = COALESCE(title_en, title)
           WHERE title_ar IS NULL OR title_en IS NULL`
        )
        .run();
    } catch {}
    const { results } = await db
      .prepare(
        `SELECT id, title, title_ar, title_en, image_url, status, submitted_by_name, submitted_by_email, created_at, updated_at
         FROM community_photos
         ORDER BY created_at DESC`
      )
      .all();
    return (results ?? []) as CommunityPhotoRow[];
  } catch (error) {
    console.warn("getAllCommunityPhotos: D1 not available, returning empty list.");
    return [];
  }
}

export async function approveCommunityPhoto(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Photo id is required");

  await db
    .prepare(`UPDATE community_photos SET status = 'approved', updated_at = unixepoch() WHERE id = ?`)
    .bind(id)
    .run();

  revalidatePath("/[locale]/admin/community-photos", "page");
  revalidatePath("/[locale]/community", "page");
}

export async function updateCommunityPhoto(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await assertAdmin();
    const db = await getDB();

    const id = String(formData.get("id") ?? "").trim();
    const titleAr = String(formData.get("title_ar") ?? "").trim();
    const titleEn = String(formData.get("title_en") ?? "").trim();
    const imageUrl = String(formData.get("image_url") ?? "").trim();

    if (!id) return { success: false, error: "Photo id is required" };
    if (!titleAr) return { success: false, error: "Arabic title is required" };
    if (!titleEn) return { success: false, error: "English title is required" };
    if (!imageUrl) return { success: false, error: "Image URL is required" };

    await db
      .prepare(
        `UPDATE community_photos
         SET title = ?, title_ar = ?, title_en = ?, image_url = ?, updated_at = unixepoch()
         WHERE id = ?`
      )
      .bind(titleAr, titleAr, titleEn, imageUrl, id)
      .run();

    revalidatePath("/[locale]/admin/community-photos", "page");
    revalidatePath("/[locale]/community", "page");
    return { success: true };
  } catch (err) {
    console.error("updateCommunityPhoto error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update photo" };
  }
}

export async function deleteCommunityPhoto(formData: FormData) {
  await assertAdmin();
  const db = await getDB();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Photo id is required");

  const row = await db
    .prepare(`SELECT image_url FROM community_photos WHERE id = ?`)
    .bind(id)
    .first<{ image_url: string | null }>();

  await db.prepare(`DELETE FROM community_photos WHERE id = ?`).bind(id).run();
  await tryDeleteImageFromR2(row?.image_url, "deleteCommunityPhoto");

  revalidatePath("/[locale]/admin/community-photos", "page");
  revalidatePath("/[locale]/community", "page");
}

