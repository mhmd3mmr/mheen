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
      .prepare(
        `SELECT id, image_url, description_ar, description_en, date
         FROM protest_banners ORDER BY sort_order ASC, created_at DESC`
      )
      .all();
    return NextResponse.json({ banners: results ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load banners";
    return NextResponse.json({ banners: [], error: message }, { status: 500 });
  }
}
