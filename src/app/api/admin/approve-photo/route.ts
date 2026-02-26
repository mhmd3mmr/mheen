export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getDB } from "@/lib/db";

type R2Bucket = {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string } }
  ) => Promise<void>;
};

function getBucket(): R2Bucket | null {
  try {
    const env = (globalThis as unknown as {
      __NEXT_ON_PAGES__?: { env?: { BUCKET?: R2Bucket } };
    }).__NEXT_ON_PAGES__?.env;
    if (env?.BUCKET) return env.BUCKET;
  } catch {}

  const proc = process.env as Record<string, unknown>;
  return (proc.BUCKET as R2Bucket | undefined) ?? null;
}

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    await assertAdmin();

    const formData = await request.formData();
    const id = String(formData.get("id") ?? "").trim();
    const titleAr = String(formData.get("title_ar") ?? "").trim();
    const titleEn = String(formData.get("title_en") ?? "").trim();
    const incomingImageUrl = String(formData.get("image_url") ?? "").trim();
    const maybeFile = formData.get("file");

    if (!id) {
      return NextResponse.json({ success: false, error: "Photo id is required" }, { status: 400 });
    }

    let imageUrl = incomingImageUrl;
    if (maybeFile instanceof File) {
      const bucket = getBucket();
      if (!bucket) {
        return NextResponse.json(
          { success: false, error: "Upload not available (R2 not configured)" },
          { status: 501 }
        );
      }
      const ext = maybeFile.name.replace(/^.*\./, "").toLowerCase() || "webp";
      const key = `community/${crypto.randomUUID()}.${ext}`;
      const buffer = await maybeFile.arrayBuffer();
      await bucket.put(key, buffer, {
        httpMetadata: { contentType: maybeFile.type || "image/webp" },
      });
      const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
      imageUrl = base ? `${base.replace(/\/$/, "")}/${key}` : key;
    }

    const db = await getDB();
    const row = await db
      .prepare(`SELECT title, title_ar, title_en, image_url FROM community_photos WHERE id = ?`)
      .bind(id)
      .first<{
        title: string | null;
        title_ar: string | null;
        title_en: string | null;
        image_url: string | null;
      }>();
    if (!row) {
      return NextResponse.json({ success: false, error: "Photo not found" }, { status: 404 });
    }

    const nextTitleAr = titleAr || row.title_ar || row.title || "";
    const nextTitleEn = titleEn || row.title_en || row.title || "";
    const nextImageUrl = imageUrl || row.image_url || "";

    await db
      .prepare(
        `UPDATE community_photos
         SET title = ?, title_ar = ?, title_en = ?, image_url = ?, status = 'approved', updated_at = unixepoch()
         WHERE id = ?`
      )
      .bind(nextTitleAr, nextTitleAr, nextTitleEn, nextImageUrl, id)
      .run();

    revalidatePath("/[locale]/admin/community-photos", "page");
    revalidatePath("/[locale]/community", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to approve photo";
    if (message === "Unauthorized") {
      return NextResponse.json({ success: false, error: message }, { status: 401 });
    }
    if (
      message.includes("D1 database binding") ||
      message.includes("Database") ||
      message.includes("database")
    ) {
      return NextResponse.json(
        { success: false, error: "Database connection failed. Please try again later." },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
