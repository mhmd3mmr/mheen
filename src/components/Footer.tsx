"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Plus, Dot } from "lucide-react";

const QUICK_LINKS = [
  { key: "home" as const, href: "/" as const },
  { key: "about" as const, href: "/about-mheen" as const },
  { key: "recordOfHonor" as const, href: "/record-of-honor" as const },
  { key: "stories" as const, href: "/stories" as const },
  { key: "submit" as const, href: "/submit" as const },
];

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white/80">
      {/* Top Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* Column 1: Identity & CTA */}
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("country")}
            </h3>
            <p className="mt-1 text-sm text-accent">
              {t("region")}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {t("ctaDesc")}
            </p>
            <Link
              href="/submit"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              {t("ctaButton")}
            </Link>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("quickLinks")}
            </h3>
            <nav className="mt-4 flex flex-col gap-1" aria-label={t("quickLinks")}>
              {QUICK_LINKS.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="group flex items-center gap-1 py-1 text-sm text-white/60 transition-colors hover:text-white"
                >
                  <Dot className="h-5 w-5 shrink-0 text-accent/50 transition-colors group-hover:text-accent" />
                  {t(key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: About the Archive */}
          <div>
            <h3 className="text-lg font-bold text-white">
              {t("aboutArchive")}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {t("aboutArchiveDesc")}
            </p>
            <Link
              href="/about-project"
              className="mt-4 inline-block text-sm font-medium text-accent transition-colors hover:text-white"
            >
              {t("madeBy")}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/50 sm:flex-row lg:px-20">
          <p>{t("copyright", { year })}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/submit"
              className="transition-colors hover:text-white"
            >
              {t("contact")}
            </Link>
            <span className="text-white/20">|</span>
            <Link
              href="/about-project"
              className="transition-colors hover:text-white"
            >
              {t("docHistory")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
