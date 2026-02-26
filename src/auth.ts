/**
 * NextAuth.js (Auth.js) configuration for Mheen Memory Archive.
 * Uses Cloudflare D1 via @auth/d1-adapter when DB binding is available
 * (e.g. when deployed to Cloudflare or run with wrangler dev).
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { D1Adapter, type D1Database } from "@auth/d1-adapter";
import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Get D1 database from the request context.
 * When running on Cloudflare (e.g. @cloudflare/next-on-pages), the request
 * or global context may expose env.DB. Adjust this to match your deployment.
 */
function getD1(request: Request | undefined): D1Database | undefined {
  // 1) Request-bound env (common in Workers runtime)
  if (request) {
    const req = request as Request & { env?: { DB?: D1Database } };
    if (req.env?.DB) return req.env.DB;
  }

  // 2) Cloudflare request context (works with next-on-pages)
  try {
    const context = getRequestContext() as { env?: { DB?: D1Database } };
    if (context?.env?.DB) return context.env.DB;
  } catch {
    // Ignore if called outside request context
  }

  // 3) Edge fallback exposed by next-on-pages
  const edgeDB = (globalThis as { __NEXT_ON_PAGES__?: { env?: { DB?: D1Database } } })
    .__NEXT_ON_PAGES__?.env?.DB;
  if (edgeDB) return edgeDB;

  // 4) Local development fallback after setupDevPlatform()
  const envDB = (process.env as Record<string, unknown>).DB;
  if (envDB) return envDB as D1Database;

  return undefined;
}

async function syncUserToDB(
  db: D1Database | undefined,
  user: { id?: string | null; name?: string | null; email?: string | null; image?: string | null },
  ownerEmail: string
) {
  if (!db) return;
  const email = (user.email ?? "").trim();
  if (!email) return;

  const name = user.name ?? null;
  const image = user.image ?? null;
  const initialRole = email === ownerEmail ? "admin" : "public";
  const providedId = (user.id ?? "").trim() || crypto.randomUUID();

  try {
    // 1) Try finding by id first (most precise)
    const byId = await db
      .prepare(`SELECT id FROM users WHERE id = ? LIMIT 1`)
      .bind(providedId)
      .first<{ id: string }>();

    if (byId?.id) {
      await db
        .prepare(
          `UPDATE users
           SET name = ?, email = ?, image = ?
           WHERE id = ?`
        )
        .bind(name, email, image, byId.id)
        .run();

      // Remove possible duplicate rows for same email, keep current id.
      await db
        .prepare(`DELETE FROM users WHERE lower(email) = lower(?) AND id != ?`)
        .bind(email, byId.id)
        .run();
      return;
    }

    // 2) If id not found, merge by email to prevent duplicates.
    const byEmail = await db
      .prepare(`SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1`)
      .bind(email)
      .first<{ id: string }>();

    if (byEmail?.id) {
      await db
        .prepare(
          `UPDATE users
           SET name = ?, email = ?, image = ?
           WHERE id = ?`
        )
        .bind(name, email, image, byEmail.id)
        .run();

      // Cleanup any legacy duplicate rows with same email.
      await db
        .prepare(`DELETE FROM users WHERE lower(email) = lower(?) AND id != ?`)
        .bind(email, byEmail.id)
        .run();
      return;
    }

    // 3) New user record.
    await db
      .prepare(
        `INSERT INTO users (id, name, email, image, role)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(providedId, name, email, image, initialRole)
      .run();
  } catch {
    // Keep auth flow resilient even if DB sync fails.
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(async (request) => {
  const db = getD1(request);

  return {
    adapter: db ? D1Adapter(db) : undefined,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        allowDangerousEmailAccountLinking: true,
      }),
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    callbacks: {
      async signIn({ user }) {
        const ownerEmail = "m.alammar.mr@gmail.com";
        await syncUserToDB(db, user, ownerEmail);
        return true;
      },
      /**
       * Attach the user's role from the database to the JWT.
       * Additionally, hardcode the project owner's email as an admin
       * to bypass local D1 issues.
       */
      async jwt({ token, user }) {
        const ownerEmail = "m.alammar.mr@gmail.com";

        // When user is present (on sign-in), prefer its role.
        const dbRole = (user as { role?: string } | undefined)?.role;

        // Hard-code owner as admin regardless of DB.
        if (user?.email === ownerEmail || token.email === ownerEmail) {
          token.role = "admin";
        } else if (dbRole) {
          token.role = dbRole;
        } else {
          token.role = token.role ?? "public";
        }

        return token;
      },
      /**
       * Pass the role from the token to the session so it is available
       * in the frontend (e.g. useSession().data?.user?.role).
       */
      async session({ session, token }) {
        const ownerEmail = "m.alammar.mr@gmail.com";

        // Ensure currently active users are present in D1 users table
        // even if they signed in before DB adapter became available.
        await syncUserToDB(
          db,
          {
            id: typeof token.sub === "string" ? token.sub : null,
            email: session.user?.email ?? token.email ?? null,
            name: session.user?.name ?? null,
            image: session.user?.image ?? null,
          },
          ownerEmail
        );

        if (session.user) {
          // Hard-code owner as admin on the session as well.
          if (session.user.email === ownerEmail) {
            session.user.role = "admin";
          } else {
            session.user.role = (token as { role?: string }).role ?? "public";
          }
        }

        return session;
      },
    },
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
  };
});
