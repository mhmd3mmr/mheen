export const runtime = 'edge';

import { setRequestLocale } from "next-intl/server";
import { getDB } from "@/lib/db";
import { HomepageClient } from "@/components/HomepageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

type HeroSlide = {
  id: string;
  image_url: string;
  title_ar: string | null;
  title_en: string | null;
  is_active: number;
  sort_order: number;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let totalMartyrs = 0;
  let totalDetainees = 0;
  let totalStories = 0;
  let latestStories: any[] = [];
  let heroSlides: HeroSlide[] = [];

  try {
    const db = await getDB();
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS hero_slides (
          id TEXT NOT NULL PRIMARY KEY,
          image_url TEXT NOT NULL,
          title_ar TEXT,
          title_en TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`
      )
      .run();

    const [martyrsRes, detaineesRes, storiesCountRes, latestRes, heroSlidesRes] =
      await Promise.all([
        db
          .prepare("SELECT COUNT(*) as count FROM martyrs WHERE status = 'approved'")
          .first<{ count: number }>(),
        db
          .prepare("SELECT COUNT(*) as count FROM detainees WHERE status = 'approved'")
          .first<{ count: number }>(),
        db
          .prepare("SELECT COUNT(*) as count FROM stories WHERE status = 'approved'")
          .first<{ count: number }>(),
        db
          .prepare(
            "SELECT id, author_name, content, image_url, created_at FROM stories WHERE status = 'approved' ORDER BY id DESC LIMIT 3"
          )
          .all(),
        db
          .prepare(
            "SELECT id, image_url, title_ar, title_en, is_active, sort_order FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC"
          )
          .all(),
      ]);

    totalMartyrs = martyrsRes?.count ?? 0;
    totalDetainees = detaineesRes?.count ?? 0;
    totalStories = storiesCountRes?.count ?? 0;
    latestStories = (latestRes?.results as any[]) ?? [];
    heroSlides = (heroSlidesRes?.results as HeroSlide[]) ?? [];
  } catch (err) {
    console.warn("HomePage: D1 not available, using fallback data.", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mheen Memory Archive",
    url: "https://miheen.com",
    inLanguage: locale === "ar" ? "ar" : "en",
    about: [
      "Mheen",
      "Homs countryside",
      "Syria",
      "Historical archive",
      "Community memory",
    ],
  };

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        // JSON-LD helps search engines understand site entity and topic.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomepageClient
        locale={locale}
        totalMartyrs={totalMartyrs}
        totalDetainees={totalDetainees}
        totalStories={totalStories}
        latestStories={latestStories}
        heroSlides={heroSlides}
      />
    </div>
  );
}
