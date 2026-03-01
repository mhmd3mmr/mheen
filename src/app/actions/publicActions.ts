"use server";

import { getDB } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public: Martyrs
// ---------------------------------------------------------------------------

export type MartyrPublic = {
  id: string;
  name_ar: string;
  name_en: string;
  birth_date: string | null;
  death_date: string | null;
  image_url: string | null;
};

export async function getPublicMartyrs(): Promise<MartyrPublic[]> {
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, name_ar, name_en, birth_date, death_date, image_url
         FROM martyrs WHERE status = 'approved' ORDER BY death_date DESC, name_en ASC`
      )
      .all();
    return (results ?? []) as MartyrPublic[];
  } catch (err) {
    console.error("getPublicMartyrs error:", err);
    return [];
  }
}

export async function submitMartyr(
  formData: FormData
): Promise<{ success: true } | { success: false; error?: string }> {
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim() || null;
  const deathDate = String(formData.get("death_date") ?? "").trim() || null;
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const submittedBy = String(formData.get("submitted_by") ?? "").trim() || null;

  if (!nameAr) {
    return { success: false, error: "اسم الشهيد بالعربية مطلوب / Arabic name is required" };
  }

  try {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO martyrs (id, name_ar, name_en, birth_date, death_date, image_url, status, submitted_by)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(id, nameAr, nameEn || nameAr, birthDate, deathDate, imageUrl, submittedBy)
      .run();
    return { success: true };
  } catch (err) {
    console.error("submitMartyr error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to submit" };
  }
}

// ---------------------------------------------------------------------------
// Public: Detainees
// ---------------------------------------------------------------------------

export type DetaineePublic = {
  id: string;
  name_ar: string;
  name_en: string;
  arrest_date: string | null;
  status_ar: string | null;
  status_en: string | null;
  image_url: string | null;
};

export async function getPublicDetainees(): Promise<DetaineePublic[]> {
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, name_ar, name_en, arrest_date, status_ar, status_en, image_url
         FROM detainees WHERE status = 'approved' ORDER BY arrest_date DESC, name_en ASC`
      )
      .all();
    return (results ?? []) as DetaineePublic[];
  } catch (err) {
    console.error("getPublicDetainees error:", err);
    return [];
  }
}

export async function submitDetainee(
  formData: FormData
): Promise<{ success: true } | { success: false; error?: string }> {
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const arrestDate = String(formData.get("arrest_date") ?? "").trim() || null;
  const statusAr = String(formData.get("status_ar") ?? "").trim() || null;
  const statusEn = String(formData.get("status_en") ?? "").trim() || null;
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const submittedBy = String(formData.get("submitted_by") ?? "").trim() || null;

  if (!nameAr) {
    return { success: false, error: "اسم المعتقل بالعربية مطلوب / Arabic name is required" };
  }

  try {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO detainees (id, name_ar, name_en, arrest_date, status_ar, status_en, image_url, status, submitted_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(id, nameAr, nameEn || nameAr, arrestDate, statusAr, statusEn, imageUrl, submittedBy)
      .run();
    return { success: true };
  } catch (err) {
    console.error("submitDetainee error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to submit" };
  }
}

// ---------------------------------------------------------------------------
// Public: Stories
// ---------------------------------------------------------------------------

/**
 * Public server action: submit a story from the "Submit a Story" form.
 * Returns { success: true } only when the D1 insert succeeds.
 */
export async function submitStory(
  formData: FormData
): Promise<{ success: true } | { success: false; error?: string }> {
  const authorName = String(formData.get("author_name") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

  if (!authorName || !content) {
    return { success: false, error: "Name and story content are required" };
  }

  try {
    const db = await getDB();
    const id = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO stories (id, author_name, content, image_url, status)
         VALUES (?, ?, ?, ?, 'pending')`
      )
      .bind(id, authorName, content, imageUrl)
      .run();

    return { success: true };
  } catch (err) {
    console.error("submitStory error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit story",
    };
  }
}

export type StoryPublic = {
  id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  status: string;
  created_at: number;
};

/** Public: fetch only approved stories for the public stories page. */
export async function getApprovedStories(): Promise<StoryPublic[]> {
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, author_name, content, image_url, status, created_at
         FROM stories
         WHERE status = 'approved'
         ORDER BY created_at DESC`
      )
      .all();
    return (results ?? []) as StoryPublic[];
  } catch (err) {
    console.error("getApprovedStories error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public: Community Photos
// ---------------------------------------------------------------------------

export type CommunityPhotoPublic = {
  id: string;
  title: string;
  image_url: string;
  created_at: number;
};

export async function submitCommunityPhoto(
  formData: FormData
): Promise<{ success: true } | { success: false; error?: string }> {
  const title = String(formData.get("title") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const submittedByName = String(formData.get("submitted_by_name") ?? "").trim() || null;
  const submittedByEmail = String(formData.get("submitted_by_email") ?? "").trim() || null;

  if (!title) {
    return { success: false, error: "Photo title is required" };
  }
  if (!imageUrl) {
    return { success: false, error: "Photo is required" };
  }

  try {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO community_photos
         (id, title, image_url, status, submitted_by_name, submitted_by_email)
         VALUES (?, ?, ?, 'pending', ?, ?)`
      )
      .bind(id, title, imageUrl, submittedByName, submittedByEmail)
      .run();
    return { success: true };
  } catch (err) {
    console.error("submitCommunityPhoto error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit photo",
    };
  }
}

export async function getApprovedCommunityPhotos(): Promise<CommunityPhotoPublic[]> {
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, title, image_url, created_at
         FROM community_photos
         WHERE status = 'approved'
         ORDER BY created_at DESC`
      )
      .all();
    return (results ?? []) as CommunityPhotoPublic[];
  } catch (err) {
    console.error("getApprovedCommunityPhotos error:", err);
    return [];
  }
}
