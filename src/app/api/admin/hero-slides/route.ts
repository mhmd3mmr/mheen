export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

type R2Bucket = {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string } }
  ) => Promise<void>;
};

function getBucket(): R2Bucket | null {
  try {
    const ctx = getRequestContext();
    const env = (ctx as unknown as { env?: { BUCKET?: R2Bucket } }).env;
    if (env?.BUCKET) return env.BUCKET;
  } catch {}

  const edgeEnv = (globalThis as unknown as {
    __NEXT_ON_PAGES__?: { env?: { BUCKET?: R2Bucket } };
  }).__NEXT_ON_PAGES__?.env;
  if (edgeEnv?.BUCKET) return edgeEnv.BUCKET;

  const proc = process.env as Record<string, unknown>;
  return (proc.BUCKET as R2Bucket | undefined) ?? null;
}

async function uploadToR2(file: File, folder: string) {
  const bucket = getBucket();
  if (!bucket) throw new Error("Upload not available (R2 not configured)");
  const ext = file.name.replace(/^.*\./, "").toLowerCase() || "webp";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "image/webp" },
  });
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").trim().replace(/\/$/, "");
  const publicUrl = base ? `${base}/${key}` : "";
  const localUrl = `/api/upload?key=${encodeURIComponent(key)}`;
  return { key, publicUrl, localUrl, url: publicUrl || localUrl };
}

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
  // Backward-compatible migration for older DB tables.
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
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const { results } = await db
      .prepare(
        `SELECT id,
                image_url,
                desktop_url,
                mobile_url,
                title_ar,
                title_en,
                is_active,
                sort_order,
                created_at,
                updated_at
         FROM hero_slides
         ORDER BY sort_order ASC, created_at DESC`
      )
      .all();
    return NextResponse.json({ slides: results ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load slides";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const formData = await request.formData();
    const desktopFile = formData.get("desktop_file");
    const mobileFile = formData.get("mobile_file");
    if (!(desktopFile instanceof File) || !(mobileFile instanceof File)) {
      return NextResponse.json({ error: "Desktop and mobile files are required" }, { status: 400 });
    }
    const titleAr = String(formData.get("title_ar") ?? "").trim() || null;
    const titleEn = String(formData.get("title_en") ?? "").trim() || null;
    const isActive = String(formData.get("is_active") ?? "true") === "true" ? 1 : 0;
    const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;

    const desktopUpload = await uploadToR2(desktopFile, "hero/desktop");
    const mobileUpload = await uploadToR2(mobileFile, "hero/mobile");

    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO hero_slides (id, image_url, desktop_url, mobile_url, title_ar, title_en, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        desktopUpload.url,
        desktopUpload.url,
        mobileUpload.url,
        titleAr,
        titleEn,
        isActive,
        sortOrder
      )
      .run();

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin/hero-slides", "page");
    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add slide";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const body = (await request.json()) as {
      id?: string;
      image_url?: string;
      desktop_url?: string;
      mobile_url?: string;
      title_ar?: string;
      title_en?: string;
      is_active?: boolean;
      sort_order?: number;
    };
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Slide id is required" }, { status: 400 });
    }

    const imageUrl = String(body.image_url ?? "").trim();
    const desktopUrl = String(body.desktop_url ?? "").trim() || imageUrl;
    const mobileUrl = String(body.mobile_url ?? "").trim() || imageUrl || desktopUrl;
    const titleAr = String(body.title_ar ?? "").trim() || null;
    const titleEn = String(body.title_en ?? "").trim() || null;
    const isActive = body.is_active === false ? 0 : 1;
    const sortOrder = Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0;

    if (!desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "Desktop and mobile URLs are required" }, { status: 400 });
    }

    await db
      .prepare(
        `UPDATE hero_slides
         SET image_url = ?, desktop_url = ?, mobile_url = ?, title_ar = ?, title_en = ?, is_active = ?, sort_order = ?, updated_at = unixepoch()
         WHERE id = ?`
      )
      .bind(desktopUrl, desktopUrl, mobileUrl, titleAr, titleEn, isActive, sortOrder, id)
      .run();

    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin/hero-slides", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update slide";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await assertAdmin();
    const db = await ensureHeroSlidesTable();
    const { id } = (await request.json()) as { id?: string };
    const slideId = String(id ?? "").trim();
    if (!slideId) {
      return NextResponse.json({ error: "Slide id is required" }, { status: 400 });
    }

    await db.prepare(`DELETE FROM hero_slides WHERE id = ?`).bind(slideId).run();
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/admin/hero-slides", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete slide";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
