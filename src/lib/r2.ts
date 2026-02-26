import { getRequestContext } from "@cloudflare/next-on-pages";

export type R2Bucket = {
  delete?: (key: string) => Promise<void>;
};

export function getR2Bucket(): R2Bucket | null {
  try {
    const ctx = getRequestContext();
    const env = (ctx as unknown as { env?: { BUCKET?: R2Bucket } })?.env;
    if (env?.BUCKET) return env.BUCKET;
  } catch {}

  if ((process.env as Record<string, unknown>).BUCKET) {
    return (process.env as Record<string, unknown>).BUCKET as R2Bucket;
  }

  const edgeEnv = (globalThis as unknown as {
    __NEXT_ON_PAGES__?: { env?: { BUCKET?: R2Bucket } };
  }).__NEXT_ON_PAGES__?.env;
  if (edgeEnv?.BUCKET) return edgeEnv.BUCKET;

  return null;
}

export function extractR2KeyFromImageUrl(imageUrl: string): string | null {
  const raw = imageUrl.trim();
  if (!raw) return null;

  // Stored as local dev URL: /api/upload?key=community/xxx.jpg
  try {
    const parsed = new URL(raw, "http://local");
    if (parsed.pathname === "/api/upload") {
      const key = parsed.searchParams.get("key");
      return key ? decodeURIComponent(key) : null;
    }
  } catch {}

  // Stored as raw key directly.
  if (/^[a-z0-9/_-]+\.[a-z0-9]+$/i.test(raw)) {
    return raw;
  }

  // Stored as public URL: <R2_PUBLIC_URL>/community/xxx.jpg
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").trim().replace(/\/$/, "");
  if (base && raw.startsWith(base + "/")) {
    return raw.slice(base.length + 1);
  }

  return null;
}
