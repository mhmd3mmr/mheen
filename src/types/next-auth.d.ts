/**
 * NextAuth.js type extensions for RBAC (role on user/session).
 * Ensures session.user.role is typed when using auth() or useSession().
 */
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
