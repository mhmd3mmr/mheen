export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
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
      .prepare(
        `SELECT id, image_url, description_ar, description_en, date
         FROM protest_banners ORDER BY date DESC, created_at DESC`
      )
      .all();
    return NextResponse.json({ banners: results ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load banners";
    return NextResponse.json({ banners: [], error: message }, { status: 500 });
  }
}
