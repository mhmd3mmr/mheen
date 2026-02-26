import { defineRouting } from "next-intl/routing";

/**
 * Locale routing: Arabic (RTL) as default, English (LTR) as secondary.
 * Default locale has no URL prefix when using localePrefix: "as-needed".
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
});
