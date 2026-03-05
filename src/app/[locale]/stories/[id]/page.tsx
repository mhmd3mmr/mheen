export const runtime = "edge";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type StoryRow = {
  id: string;
  author_name: string | null;
  author_ar: string | null;
  author_en: string | null;
  title_ar: string | null;
  title_en: string | null;
  content: string | null;
  content_ar: string | null;
  content_en: string | null;
  image_url: string | null;
  created_at: number | null;
  status: string;
};

const SITE_URL = "https://miheen.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-share.jpg`;

function summary(text: string, max = 150) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function toOgVariantUrl(mainImageUrl: string) {
  try {
    const url = new URL(mainImageUrl);
    const key = url.searchParams.get("key");
    if (key && /(\.[\w\d_-]+)$/i.test(key)) {
      url.searchParams.set("key", key.replace(/(\.[\w\d_-]+)$/i, "-og$1"));
      return url.toString();
    }
    if (/(\.[\w\d_-]+)$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/(\.[\w\d_-]+)$/i, "-og$1");
      return url.toString();
    }
    return mainImageUrl;
  } catch {
    if (/(\.[\w\d_-]+)$/i.test(mainImageUrl)) {
      return mainImageUrl.replace(/(\.[\w\d_-]+)$/i, "-og$1");
    }
    return mainImageUrl;
  }
}

async function getStoryById(id: string): Promise<StoryRow | null> {
  const db = await getDB();
  const row = await db
    .prepare(
      `SELECT id, author_name, author_ar, author_en, title_ar, title_en, content, content_ar, content_en, image_url, created_at, status
       FROM stories
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<StoryRow>();
  return row ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const story = await getStoryById(id);
  if (!story) {
    return {
      title: isAr ? "قصة غير موجودة | أرشيف مهين" : "Story Not Found | Mheen Archive",
      description: isAr ? "لم يتم العثور على القصة المطلوبة." : "The requested story was not found.",
    };
  }

  const title = isAr
    ? story.title_ar || story.title_en || "قصة من أرشيف مهين"
    : story.title_en || story.title_ar || "Story from Mheen Archive";
  const content = isAr
    ? story.content_ar || story.content_en || story.content || ""
    : story.content_en || story.content_ar || story.content || "";
  const desc = summary(content || (isAr ? "قصة من بلدة مهين." : "A story from Mheen town."));
  const canonical = `${SITE_URL}/${locale}/stories/${id}`;

  // Build OG images array with HEAD check + fallback
  const dbImageUrl = story.image_url;
  const ogImages: { url: string; width: number; height: number; type: string }[] = [];

  if (dbImageUrl) {
    const absoluteDbUrl = dbImageUrl.startsWith("http")
      ? dbImageUrl
      : `${SITE_URL}${dbImageUrl.startsWith("/") ? "" : "/"}${dbImageUrl}`;

    // Default to the raw WebP (or JPEG) from DB
    let verifiedUrl = absoluteDbUrl;
    let verifiedType = absoluteDbUrl.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg";

    try {
      // Fast check: Does the WhatsApp-friendly JPG exist in Cloudflare R2?
      const ogVariantUrl = toOgVariantUrl(absoluteDbUrl);
      if (ogVariantUrl !== absoluteDbUrl) {
        const response = await fetch(ogVariantUrl, { method: "HEAD" });
        if (response.ok) {
          verifiedUrl = ogVariantUrl;
          verifiedType = "image/jpeg";
        }
      }
    } catch {
      // Silently fail and stick to the raw URL
    }

    // 1. Push the specific story image (JPG if new, WebP if old)
    ogImages.push({
      url: verifiedUrl,
      width: 1200,
      height: 630,
      type: verifiedType,
    });
  }

  // 2. ALWAYS push a guaranteed JPG fallback for WhatsApp
  // USER MUST ENSURE THIS FILE EXISTS IN public/images/
  ogImages.push({
    url: `${SITE_URL}/images/default-share.jpg`,
    width: 1200,
    height: 630,
    type: "image/jpeg",
  });

  return {
    title: `${title} | ${isAr ? "أرشيف مهين" : "Mheen Archive"}`,
    description: desc,
    keywords: isAr
      ? ["مهين", "ريف حمص", "الثورة السورية", "قصص مهين", "أرشيف مهين"]
      : ["Mheen", "Homs countryside", "Syrian Revolution", "Mheen stories", "Mheen archive"],
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar/stories/${id}`,
        en: `${SITE_URL}/en/stories/${id}`,
        "x-default": `${SITE_URL}/ar/stories/${id}`,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description: desc,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ogImages.map((img) => img.url),
    },
    other: {
      itemprop: "image",
      image: ogImages[0]?.url ?? DEFAULT_OG_IMAGE,
    },
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const story = await getStoryById(id);
  if (!story) notFound();

  const title = isAr
    ? story.title_ar || story.title_en || "قصة من أرشيف مهين"
    : story.title_en || story.title_ar || "Story from Mheen Archive";
  const author = isAr
    ? story.author_ar || story.author_en || story.author_name || "مجهول"
    : story.author_en || story.author_ar || story.author_name || "Unknown";
  const content = isAr
    ? story.content_ar || story.content_en || story.content || ""
    : story.content_en || story.content_ar || story.content || "";
  const published = story.created_at
    ? new Date(story.created_at * 1000).toISOString()
    : new Date().toISOString();
  const image = story.image_url || `${SITE_URL}/images/mheen-oasis-city.webp`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    author: { "@type": "Person", name: author },
    datePublished: published,
    dateModified: published,
    image: [image],
    inLanguage: isAr ? "ar" : "en",
    mainEntityOfPage: `${SITE_URL}/${locale}/stories/${id}`,
    description: summary(content),
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-qomra text-3xl font-bold text-primary md:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-foreground/60">{author}</p>
      {story.image_url && (
        <img
          src={story.image_url}
          alt={title || "صورة من أرشيف بلدة مهين"}
          className="mt-6 w-full rounded-2xl border border-primary/10 object-cover"
        />
      )}
      <article className="mt-8 space-y-5 text-base leading-loose text-foreground/80 md:text-lg">
        {content
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
      </article>
    </main>
  );
}
