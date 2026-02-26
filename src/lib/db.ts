import type { D1Database } from "@auth/d1-adapter";
import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Robustly resolve the Cloudflare D1 database binding across environments.
 */
export async function getDB(): Promise<D1Database> {
  let db: unknown;

  // 1. Try standard Cloudflare Context (Production & Pages Dev)
  try {
    const context = getRequestContext();
    if ((context as any)?.env?.DB) {
      db = (context as any).env.DB;
    }
  } catch {
    // Ignore context errors
  }

  // 2. Fallback to process.env (Local dev with setupDevPlatform)
  if (!db && (process.env as Record<string, unknown>).DB) {
    db = (process.env as Record<string, unknown>).DB;
  }

  // 3. Fallback to globalThis (Edge runtime fallback)
  if (
    !db &&
    (globalThis as any).__NEXT_ON_PAGES__?.env?.DB
  ) {
    db = (globalThis as any).__NEXT_ON_PAGES__.env.DB;
  }

  if (!db) {
    throw new Error(
      "D1 database binding 'DB' is not available. Ensure it's passed correctly."
    );
  }

  return db as D1Database;
}



