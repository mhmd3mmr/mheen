export const runtime = "edge";

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

type RecordRow = {
  id: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  death_date?: string | null;
  birth_date?: string | null;
  martyrdom_method?: string | null;
  martyrdom_details?: string | null;
  tags?: string | null;
  arrest_date?: string | null;
  status_ar?: string | null;
  status_en?: string | null;
};

export async function GET(request: Request) {
  try {
    const db = await getDB();
    const url = new URL(request.url);
    const rawPage = Number(url.searchParams.get("page") ?? "1");
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = 24;
    const offset = (page - 1) * limit;
    try {
      await db.prepare(`ALTER TABLE martyrs ADD COLUMN martyrdom_method TEXT`).run();
    } catch {}
    try {
      await db.prepare(`ALTER TABLE martyrs ADD COLUMN martyrdom_details TEXT`).run();
    } catch {}
    try {
      await db.prepare(`ALTER TABLE martyrs ADD COLUMN tags TEXT`).run();
    } catch {}
    try {
      await db.prepare(`ALTER TABLE detainees ADD COLUMN tags TEXT`).run();
    } catch {}

    const [{ results }, totalRes] = await Promise.all([
      db
        .prepare(
          `SELECT *
           FROM (
             SELECT id, name_ar, name_en, image_url, death_date, birth_date,
                    martyrdom_method, martyrdom_details, tags,
                    NULL AS arrest_date, NULL AS status_ar, NULL AS status_en,
                    'martyr' AS recordType
             FROM martyrs
             WHERE status = 'approved'
             UNION ALL
             SELECT id, name_ar, name_en, image_url, NULL AS death_date, NULL AS birth_date,
                    NULL AS martyrdom_method, NULL AS martyrdom_details, tags,
                    arrest_date, status_ar, status_en,
                    'detainee' AS recordType
             FROM detainees
             WHERE status = 'approved'
           )
           ORDER BY COALESCE(death_date, arrest_date) DESC, name_en ASC
           LIMIT ? OFFSET ?`
        )
        .bind(limit, offset)
        .all<RecordRow & { recordType: "martyr" | "detainee" }>(),
      db
        .prepare(
          `SELECT
             (SELECT COUNT(*) FROM martyrs WHERE status = 'approved')
             +
             (SELECT COUNT(*) FROM detainees WHERE status = 'approved')
             AS total`
        )
        .first<{ total: number }>(),
    ]);

    const total = Number(totalRes?.total ?? 0);
    const records = (results ?? []) as Array<RecordRow & { recordType: "martyr" | "detainee" }>;
    const martyrsCount = records.filter((r) => r.recordType === "martyr").length;
    const detaineesCount = records.filter((r) => r.recordType === "detainee").length;
    const hasMore = offset + records.length < total;

    return NextResponse.json({
      records,
      page,
      limit,
      hasMore,
      counts: {
        martyrs: martyrsCount,
        detainees: detaineesCount,
        total,
      },
    });
  } catch (err) {
    console.error("GET /api/records/get-all failed:", err);
    return NextResponse.json(
      { error: "Failed to load records", records: [], counts: { martyrs: 0, detainees: 0 } },
      { status: 500 }
    );
  }
}
