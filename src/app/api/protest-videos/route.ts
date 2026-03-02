export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
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
      .prepare(
        `SELECT id, youtube_url, title_ar, title_en, date
         FROM protest_videos ORDER BY date DESC, created_at DESC`
      )
      .all();
    return NextResponse.json({ videos: results ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load videos";
    return NextResponse.json({ videos: [], error: message }, { status: 500 });
  }
}
