export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasPagination =
      searchParams.has("limit") || searchParams.has("offset");
    const limitRaw = Number(searchParams.get("limit") ?? 20);
    const offsetRaw = Number(searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100)
      : 20;
    const offset = Number.isFinite(offsetRaw)
      ? Math.max(Math.trunc(offsetRaw), 0)
      : 0;

    const db = await getDB();
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS protest_videos (
          id TEXT NOT NULL PRIMARY KEY,
          youtube_url TEXT NOT NULL,
          title_ar TEXT NOT NULL,
          title_en TEXT,
          date TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`
      )
      .run();
    try {
      await db.prepare(`ALTER TABLE protest_videos ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`).run();
    } catch {}
    try {
      await db
        .prepare(
          `WITH ranked AS (
             SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
             FROM protest_videos
           )
           UPDATE protest_videos
           SET sort_order = (
             SELECT rn FROM ranked WHERE ranked.id = protest_videos.id
           )
           WHERE COALESCE(sort_order, 0) = 0`
        )
        .run();
    } catch {}

    if (!hasPagination) {
      const { results } = await db
        .prepare(
          `SELECT id, youtube_url, title_ar, title_en, date
           FROM protest_videos ORDER BY sort_order ASC, created_at DESC`
        )
        .all();
      return NextResponse.json({ videos: results ?? [] });
    }

    const { results } = await db
      .prepare(
        `SELECT id, youtube_url, title_ar, title_en, date
         FROM protest_videos
         ORDER BY sort_order ASC, created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(limit + 1, offset)
      .all();

    const rows = (results ?? []) as Array<Record<string, unknown>>;
    const hasMore = rows.length > limit;
    const videos = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      videos,
      pagination: { limit, offset, hasMore },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load videos";
    return NextResponse.json({ videos: [], error: message }, { status: 500 });
  }
}
