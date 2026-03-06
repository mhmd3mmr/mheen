import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

/**
 * next-intl middleware: locale detection, redirects, and cookie.
 * Editors are restricted to /admin/announcements only; other admin routes redirect here.
 */
const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAdminArea = /^\/(ar|en)\/admin(?:\/|$)/.test(pathname);
  const isAnnouncementsPage = /^\/(ar|en)\/admin\/announcements(?:\/|$)/.test(pathname);

  if (isAdminArea && !isAnnouncementsPage) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });
    const role = (token as { role?: string } | null)?.role ?? "public";
    if (role === "editor") {
      const locale = pathname.startsWith("/en") ? "en" : "ar";
      return NextResponse.redirect(new URL(`/${locale}/admin/announcements`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
