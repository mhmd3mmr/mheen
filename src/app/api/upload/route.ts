import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

type R2Bucket = {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string } }
  ) => Promise<void>;
  get: (key: string) => Promise<R2Object | null>;
};

type R2Object = {
  body: ReadableStream | null;
  httpMetadata?: { contentType?: string };
};

type ContextWithBucket = {
  env?: {
    BUCKET?: R2Bucket;
  };
};

function getR2Bucket(): R2Bucket | null {
  try {
    const ctx = getRequestContext() as unknown as ContextWithBucket;
    if (ctx?.env?.BUCKET) return ctx.env.BUCKET;
  } catch {}

  if ((process.env as Record<string, unknown>).BUCKET) {
    return (process.env as Record<string, unknown>).BUCKET as unknown as R2Bucket;
  }

  const globalContext = globalThis as unknown as {
    __NEXT_ON_PAGES__?: ContextWithBucket;
  };
  if (globalContext.__NEXT_ON_PAGES__?.env?.BUCKET) {
    return globalContext.__NEXT_ON_PAGES__.env.BUCKET;
  }

  return null;
}

export async function POST(request: Request) {
  const bucket = getR2Bucket();
  if (!bucket) {
    return NextResponse.json(
      { error: "Upload not available (R2 not configured)" },
      { status: 501 }
    );
  }

  let file: File;
  let folder = "stories";
  let requestedKey = "";
  try {
    const formData = await request.formData();
    const f = formData.get("file");
    if (!f || !(f instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    file = f;
    folder = String(formData.get("folder") ?? "").trim() || "stories";
    requestedKey = String(formData.get("key") ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const ext = file.name.replace(/^.*\./, "") || "bin";
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "stories";
  const safeRequestedKey = requestedKey
    .replace(/[^a-z0-9/_\-.]/gi, "")
    .replace(/^\/+|\/+$/g, "");
  const key = safeRequestedKey || `${safeFolder}/${crypto.randomUUID()}.${ext}`;

  try {
    const buffer = await file.arrayBuffer();
    await bucket.put(key, buffer, {
      httpMetadata: { contentType: file.type || undefined },
    });
  } catch (err) {
    console.error("R2 put error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }

  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  const publicUrl = base ? `${base.replace(/\/$/, "")}/${key}` : key;

  const origin = new URL(request.url).origin;
  const localUrl = `${origin}/api/upload?key=${encodeURIComponent(key)}`;

  return NextResponse.json({ url: localUrl, publicUrl, key });
}

/**
 * GET /api/upload?key=stories/xxx.jpg
 * Serves files from R2 during local development.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const bucket = getR2Bucket();
  if (!bucket) {
    return new Response("R2 not configured", { status: 501 });
  }

  try {
    const obj = await bucket.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    if (obj.httpMetadata?.contentType) {
      headers.set("Content-Type", obj.httpMetadata.contentType);
    }
    headers.set("Cache-Control", "public, max-age=31536000");
    return new Response(obj.body, { headers });
  } catch {
    return new Response("Failed to read file", { status: 500 });
  }
}
