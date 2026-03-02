export const runtime = "edge";

import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import AdminProtestVideosClient from "./AdminProtestVideosClient";

async function getVideos() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") return [];

  try {
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
    const { results } = await db
      .prepare(`SELECT * FROM protest_videos ORDER BY created_at DESC`)
      .all();
    return (results ?? []) as any[];
  } catch {
    return [];
  }
}

export default async function AdminProtestVideosPage() {
  const videos = await getVideos();
  return <AdminProtestVideosClient initialVideos={videos} />;
}
