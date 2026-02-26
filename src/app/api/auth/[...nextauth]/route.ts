export const runtime = 'edge';

/**
 * NextAuth.js catch-all route handler for Auth.js.
 * Handles GET/POST for /api/auth/* (signin, signout, session, providers, etc.).
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
