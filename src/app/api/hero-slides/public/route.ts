export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

async function ensureHeroSlidesTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS hero_slides (
        id TEXT NOT NULL PRIMARY KEY,
        image_url TEXT,
        desktop_url TEXT,
        mobile_url TEXT,
        title_ar TEXT,
        title_en TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`
    )
    .run();
  try {
    await db.prepare(`ALTER TABLE hero_slides ADD COLUMN desktop_url TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE hero_slides ADD COLUMN mobile_url TEXT`).run();
  } catch {}
  try {
    await db
      .prepare(
        `UPDATE hero_slides
         SET desktop_url = COALESCE(desktop_url, image_url),
             mobile_url = COALESCE(mobile_url, image_url)
         WHERE desktop_url IS NULL OR mobile_url IS NULL`
      )
      .run();
  } catch {}
  return db;
}

export async function GET() {
  try {
    const db = await ensureHeroSlidesTable();
    const { results } = await db
      .prepare(
        `SELECT id,
                image_url,
                desktop_url,
                mobile_url,
                title_ar,
                title_en
         FROM hero_slides
         WHERE is_active = 1
         ORDER BY sort_order ASC, created_at DESC`
      )
      .all();

    const slides =
      (results ?? []).map((row: any) => ({
        id: row.id as string,
        desktop: (row.desktop_url || row.image_url || "") as string,
        mobile: (row.mobile_url || row.desktop_url || row.image_url || "") as string,
        title_ar: (row.title_ar || "") as string,
        title_en: (row.title_en || "") as string,
      })) ?? [];

    return NextResponse.json({ slides });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load hero slides";
    return NextResponse.json({ slides: [], error: message }, { status: 500 });
  }
}

