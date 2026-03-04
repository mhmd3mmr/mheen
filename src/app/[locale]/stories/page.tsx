export const runtime = "edge";

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import StoriesClient from "@/components/StoriesClient";
import { getDB } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
};

type StoryRow = {
  id: string;
  author_name: string | null;
  author_ar: string | null;
  author_en: string | null;
  title_ar: string | null;
  title_en: string | null;
  category: "history" | "memories" | "figures" | "other" | null;
  content: string | null;
  content_ar: string | null;
  content_en: string | null;
  tags: string | null;
  image_url: string | null;
  created_at: number;
};

const SITE_URL = "https://miheen.com";
const PAGE_SIZE = 24;
const DEFAULT_SHARE_IMAGE = "/default-share-image.jpg";

function summarize(text: string, max = 150) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}...` : s;
}

function resolveAbsoluteStoryImage(raw: string | null) {
  const candidate = (raw || DEFAULT_SHARE_IMAGE).trim();
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
  if (candidate.startsWith("/")) return `${SITE_URL}${candidate}`;
  return `${SITE_URL}/${candidate}`;
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

async function getStoriesPageOne() {
  const db = await getDB();
  const [storiesRes, totalRes] = await Promise.all([
    db
      .prepare(
        `SELECT id, author_name, author_ar, author_en, title_ar, title_en, category,
                content, content_ar, content_en, tags, image_url, created_at
         FROM stories
         WHERE status = 'approved'
         ORDER BY created_at DESC
         LIMIT ? OFFSET 0`
      )
      .bind(PAGE_SIZE)
      .all<StoryRow>(),
    db.prepare(`SELECT COUNT(*) AS total FROM stories WHERE status = 'approved'`).first<{ total: number }>(),
  ]);

  const stories = storiesRes.results ?? [];
  const total = Number(totalRes?.total ?? 0);
  const hasMore = stories.length < total;
  return { stories, hasMore };
}

async function getStoryById(id: string) {
  const db = await getDB();
  const story = await db
    .prepare(
      `SELECT id, author_name, author_ar, author_en, title_ar, title_en, category,
              content, content_ar, content_en, tags, image_url, created_at
       FROM stories
       WHERE status = 'approved' AND id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<StoryRow>();
  return story ?? null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { id } = await searchParams;
  const isAr = locale === "ar";

  if (!id) {
    return {
      title: isAr ? "القصص | أرشيف مهين" : "Stories | Mheen Archive",
      description: isAr
        ? "قصص وتجارب أهالي مهين بين الذاكرة والصمود."
        : "Stories and testimonies from Mheen people, memory and resilience.",
    };
  }

  const story = await getStoryById(id);
  if (!story) {
    return {
      title: isAr ? "القصص | أرشيف مهين" : "Stories | Mheen Archive",
      description: isAr
        ? "قصص وتجارب أهالي مهين بين الذاكرة والصمود."
        : "Stories and testimonies from Mheen people, memory and resilience.",
    };
  }

  const storyTitle = isAr ? story.title_ar || story.title_en : story.title_en || story.title_ar;
  const storyBody = isAr
    ? story.content_ar || story.content_en || story.content || ""
    : story.content_en || story.content_ar || story.content || "";
  const title = storyTitle || (isAr ? "قصة من أرشيف مهين" : "Story from Mheen Archive");
  const description = summarize(storyBody || (isAr ? "قصة من أرشيف مهين." : "Story from Mheen Archive."));
  const mainImageUrl = resolveAbsoluteStoryImage(story.image_url);
  const finalImageUrl = story.image_url ? toOgVariantUrl(mainImageUrl) : mainImageUrl;
  const imagePathWithoutQuery = finalImageUrl.split("?")[0].toLowerCase();
  const mimeType = imagePathWithoutQuery.endsWith(".png")
    ? "image/png"
    : imagePathWithoutQuery.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";
  const canonical = `${SITE_URL}/${locale}/stories?id=${story.id}`;

  return {
    title: `${title} | ${isAr ? "أرشيف مهين" : "Mheen Archive"}`,
    description,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar/stories?id=${story.id}`,
        en: `${SITE_URL}/en/stories?id=${story.id}`,
        "x-default": `${SITE_URL}/ar/stories?id=${story.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [
        {
          url: finalImageUrl,
          width: 1200,
          height: 630,
          type: mimeType,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [finalImageUrl],
    },
    other: {
      itemprop: "image",
      image: finalImageUrl,
    },
  };
}

export default async function StoriesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { id } = await searchParams;
  setRequestLocale(locale);

  let stories: StoryRow[] = [];
  let hasMore = false;
  try {
    const pageOne = await getStoriesPageOne();
    stories = pageOne.stories;
    hasMore = pageOne.hasMore;
    if (id) {
      const deepLinked = await getStoryById(id);
      if (deepLinked && !stories.some((s) => s.id === deepLinked.id)) {
        stories = [deepLinked, ...stories];
      }
    }
  } catch (err) {
    console.error("StoriesPage fetch error:", err);
  }

  return <StoriesClient initialStories={stories} locale={locale} initialHasMore={hasMore} />;
}
