"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Wraps the app with NextAuth SessionProvider so useSession, signIn, signOut work.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
