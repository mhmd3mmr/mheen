import type { MetadataRoute } from "next";

const BASE_URL = "https://miheen.com";
const LOCALES = ["ar", "en"] as const;
const ROUTES = [
  "",
  "/about-mheen",
  "/about",
  "/about-project",
  "/community",
  "/record-of-honor",
  "/stories",
  "/timeline",
  "/uprising",
  "/gallery",
  "/submit",
  "/submit-community-photo",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.7,
      });
    }
  }

  return entries;
}
