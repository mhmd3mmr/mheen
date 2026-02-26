"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const RTL_LOCALE = "ar";

/**
 * Sets document dir and lang from the current locale (first path segment).
 * Root layout cannot read [locale], so we sync direction/language on the client.
 */
export function LocaleDirection() {
  const pathname = usePathname();
  useEffect(() => {
    const segment = pathname?.split("/")[1];
    const locale = segment === "en" ? "en" : RTL_LOCALE;
    const dir = locale === RTL_LOCALE ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [pathname]);
  return null;
}
