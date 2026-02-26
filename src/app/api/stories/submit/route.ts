export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
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
    const ctx = getRequestContext();
    const env = (ctx as unknown as { env?: { BUCKET?: R2Bucket } }).env;
    if (env?.BUCKET) return env.BUCKET;
  } catch {}

  const proc = process.env as Record<string, unknown>;
  return (proc.BUCKET as R2Bucket | undefined) ?? null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const authorName = String(formData.get("author_name") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    let imageUrl = String(formData.get("image_url") ?? "").trim() || null;
    const file = formData.get("file");

    if (!authorName || !content) {
      return NextResponse.json(
        { success: false, error: "Name and story content are required" },
        { status: 400 }
      );
    }

    // If a file is sent directly, upload it to R2 from this endpoint.
    if (file instanceof File) {
      const bucket = getBucket();
      if (!bucket) {
        return NextResponse.json(
          { success: false, error: "Upload not available (R2 not configured)" },
          { status: 501 }
        );
      }
      const ext = file.name.replace(/^.*\./, "").toLowerCase() || "webp";
      const key = `stories/${crypto.randomUUID()}.${ext}`;
      const buffer = await file.arrayBuffer();
      await bucket.put(key, buffer, {
        httpMetadata: { contentType: file.type || "image/webp" },
      });
      const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
      imageUrl = base ? `${base.replace(/\/$/, "")}/${key}` : key;
    }

    const db = await getDB();
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO stories (id, author_name, content, image_url, status)
         VALUES (?, ?, ?, ?, 'pending')`
      )
      .bind(id, authorName, content, imageUrl)
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit story";
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
