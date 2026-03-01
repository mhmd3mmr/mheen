"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, LogOut, Plus } from "lucide-react";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "aboutMheen", href: "/about-mheen" },
  { key: "community", href: "/community" },
  { key: "recordOfHonor", href: "/record-of-honor" },
  { key: "stories", href: "/stories" },
] as const;

function stripLocale(pathname: string | undefined): string {
  if (!pathname) return "/";
  return pathname.replace(/^\/(ar|en)(\/|$)/, "$2").replace(/^$/, "/") || "/";
}

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "contributor";
  const isAr = locale === "ar";
  const otherLocale = isAr ? "en" : "ar";
  const isHome = path === "/";
  const transparentAtTop = isHome && !isScrolled && !mobileOpen;
  const activeTextClass = transparentAtTop ? "text-white" : "text-white";
  const mutedTextClass = transparentAtTop
    ? "text-white/85 hover:text-white"
    : "text-white/55 hover:text-white/90";
  const softIconClass = transparentAtTop
    ? "text-white/85 hover:bg-white/10 hover:text-white"
    : "text-white/40 hover:bg-white/10 hover:text-white";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 w-full backdrop-blur-md transition-colors duration-300 ${
          transparentAtTop
            ? "border-b border-transparent bg-gradient-to-b from-black/35 via-black/10 to-transparent text-white"
            : "border-b border-white/10 bg-primary/95 text-white shadow-sm"
        }`}
      >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* ── Logo ── */}
        <Link href="/" className="group flex shrink-0 items-baseline gap-2">
          <span
            className={`font-qomra text-2xl font-bold tracking-tight transition-opacity group-hover:opacity-90 ${
              transparentAtTop ? "text-white" : "text-white"
            }`}
          >
            {isAr ? "مهين" : "Mheen"}
          </span>
          <span
            className={`hidden text-[11px] lg:inline ${
              transparentAtTop ? "text-white/70" : "text-white/35"
            }`}
          >
            {t("archiveLabel")}
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <nav className="hidden flex-1 items-center gap-0.5 md:flex" aria-label="Main">
          {NAV_ITEMS.map(({ key, href }) => {
            const isActive =
              (href === "/" && path === "/") ||
              (href !== "/" && path.startsWith(href));
            return (
              <Link
                key={key}
                href={href}
                className={`relative rounded-lg px-3 py-2 text-[13px] font-medium transition-colors lg:px-3.5 ${
                  isActive
                    ? activeTextClass
                    : mutedTextClass
                }`}
              >
                {t(key)}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className={`absolute inset-x-2 -bottom-[1.05rem] h-[2px] rounded-full ${
                      transparentAtTop ? "bg-white" : "bg-accent"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop end: auth + lang + CTA ── */}
        <div className="hidden shrink-0 items-center gap-1 md:flex">
          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${mutedTextClass}`}
            >
              {t("dashboard")}
            </Link>
          )}

          {status !== "loading" && session && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              className={`rounded-lg p-2 transition-colors ${softIconClass}`}
              aria-label={t("logout")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {status !== "loading" && !session && (
            <Link
              href="/login"
              className={`rounded-lg px-2.5 py-2 text-[13px] transition-colors ${mutedTextClass}`}
            >
              {t("login")}
            </Link>
          )}

          <div
            className={`ms-0.5 border-s ps-1.5 ${
              transparentAtTop ? "border-emerald-100/35" : "border-white/15"
            }`}
          >
            <Link
              href={path}
              locale={otherLocale}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                transparentAtTop
                  ? "text-white/90 hover:bg-white/10 hover:text-white"
                  : "text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              {isAr ? "EN" : "عربي"}
            </Link>
          </div>

          <Link
            href="/submit"
            className="ms-1.5 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[13px] font-semibold text-primary transition-all hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("submitStory")}
          </Link>
        </div>

        {/* ── Mobile end: lang + hamburger ── */}
        <div className="ms-auto flex items-center gap-1 md:hidden">
          <Link
            href={path}
            locale={otherLocale}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              transparentAtTop
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4" />
            {isAr ? "EN" : "عربي"}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={`rounded-lg p-2 transition-colors ${
              transparentAtTop
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-white/80 hover:bg-white/10"
            }`}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`overflow-hidden border-t md:hidden ${
              transparentAtTop
                ? "border-primary/10 bg-white/95 text-primary"
                : "border-white/10 bg-primary text-white"
            }`}
          >
            <nav className="mx-auto flex max-w-7xl flex-col px-4 pb-5 pt-3" aria-label="Mobile">
              {NAV_ITEMS.map(({ key, href }) => {
                const isActive =
                  (href === "/" && path === "/") ||
                  (href !== "/" && path.startsWith(href));
                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? transparentAtTop
                          ? "bg-primary/10 text-primary"
                          : "bg-white/10 text-accent"
                        : transparentAtTop
                          ? "text-primary/80 hover:bg-primary/5 hover:text-primary"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {t(key)}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    transparentAtTop
                      ? "text-primary/80 hover:bg-primary/5 hover:text-primary"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {t("dashboard")}
                </Link>
              )}

              <div
                className={`my-3 border-t ${
                  transparentAtTop ? "border-primary/10" : "border-white/10"
                }`}
              />

              <Link
                href="/submit"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-primary transition-all hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                {t("submitStory")}
              </Link>

              <div className="mt-3">
                {session ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-start text-sm ${
                      transparentAtTop
                        ? "text-primary/70 hover:bg-primary/5"
                        : "text-white/50 hover:bg-white/5"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-4 py-3 text-sm ${
                      transparentAtTop
                        ? "text-primary/70 hover:bg-primary/5"
                        : "text-white/50 hover:bg-white/5"
                    }`}
                  >
                    {t("login")}
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
      {!isHome && <div className="h-16" />}
    </>
  );
}
