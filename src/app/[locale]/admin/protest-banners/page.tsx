export const runtime = "edge";

import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import AdminProtestBannersClient from "./AdminProtestBannersClient";

async function getBanners() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") return [];

  try {
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
    const { results } = await db
      .prepare(`SELECT * FROM protest_banners ORDER BY sort_order ASC, created_at DESC`)
      .all();
    return (results ?? []) as any[];
  } catch {
    return [];
  }
}

export default async function AdminProtestBannersPage() {
  const banners = await getBanners();
  return <AdminProtestBannersClient initialBanners={banners} />;
}
