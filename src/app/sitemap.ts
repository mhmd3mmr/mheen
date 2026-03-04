import type { MetadataRoute } from "next";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const BASE_URL = "https://miheen.com";
const LOCALES = ["ar", "en"] as const;
const ROUTES = [
  "",
  "/revolution",
  "/contribute",
  "/about-project",
  "/about-mheen",
  "/record-of-honor",
  "/detainees",
  "/stories",
  "/timeline",
  "/uprising",
  "/gallery",
  "/submit",
  "/submit-community-photo",
] as const;

function fromUnix(ts?: number | null) {
  if (!ts || Number.isNaN(Number(ts))) return new Date();
  return new Date(Number(ts) * 1000);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.7,
      });
    }
  }

  try {
    const db = await getDB();
    const stories = await db
      .prepare(
        `SELECT id, created_at
         FROM stories
         WHERE status = 'approved'
         ORDER BY created_at DESC`
      )
      .all<{ id: string; created_at: number }>();

    const martyrs = await db
      .prepare(
        `SELECT id, death_date
         FROM martyrs
         WHERE status = 'approved'`
      )
      .all<{ id: string; death_date: string | null }>();

    const detainees = await db
      .prepare(
        `SELECT id, arrest_date
         FROM detainees
         WHERE status = 'approved'`
      )
      .all<{ id: string; arrest_date: string | null }>();

    const banners = await db
      .prepare(
        `SELECT id, created_at
         FROM protest_banners
         ORDER BY created_at DESC`
      )
      .all<{ id: string; created_at: number }>();

    const communityPhotos = await db
      .prepare(
        `SELECT id, COALESCE(updated_at, created_at) AS updated_at
         FROM community_photos
         WHERE status = 'approved'
         ORDER BY updated_at DESC`
      )
      .all<{ id: string; updated_at: number }>();

    const photoIds = new Map<string, Date>();
    for (const row of banners.results ?? []) {
      photoIds.set(row.id, fromUnix(row.created_at));
    }
    for (const row of communityPhotos.results ?? []) {
      if (!photoIds.has(row.id)) photoIds.set(row.id, fromUnix(row.updated_at));
    }

    for (const locale of LOCALES) {
      // Stories deep links: /stories?id=...
      for (const s of stories.results ?? []) {
        entries.push({
          url: `${BASE_URL}/${locale}/stories?id=${encodeURIComponent(s.id)}`,
          lastModified: fromUnix(s.created_at),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      // Martyrs: /record-of-honor?id=...
      for (const r of martyrs.results ?? []) {
        entries.push({
          url: `${BASE_URL}/${locale}/record-of-honor?id=${encodeURIComponent(r.id)}`,
          lastModified: r.death_date ? new Date(r.death_date) : now,
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }

      // Detainees: /detainees?id=...
      for (const r of detainees.results ?? []) {
        entries.push({
          url: `${BASE_URL}/${locale}/detainees?id=${encodeURIComponent(r.id)}`,
          lastModified: r.arrest_date ? new Date(r.arrest_date) : now,
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }

      // Gallery items (banners + community photos)
      for (const [id, lastModified] of photoIds.entries()) {
        entries.push({
          url: `${BASE_URL}/${locale}/gallery/${encodeURIComponent(id)}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.55,
        });
      }
    }
  } catch (err) {
    console.error("Sitemap generation error:", err);
    // نبقي فقط المسارات الثابتة إذا فشل الوصول لقاعدة البيانات.
  }

  return entries;
}
