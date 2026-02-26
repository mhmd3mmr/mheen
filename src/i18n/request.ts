import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Request-scoped i18n config: loads messages for the active locale.
 * Used by next-intl plugin and Server Components.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "ar" | "en")) {
    locale = routing.defaultLocale;
  }
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
  }
  return {
    locale,
    messages,
  };
});
