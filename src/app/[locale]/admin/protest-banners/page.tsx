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
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`
      )
      .run();
    const { results } = await db
      .prepare(`SELECT * FROM protest_banners ORDER BY created_at DESC`)
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
