export const runtime = "edge";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ensureAnnouncementsTable } from "@/lib/api/announcements";
import { toOgVariantUrl } from "@/lib/og";
import { getDB } from "@/lib/db";
import { AnnouncementShareButtons } from "@/components/AnnouncementShareButtons";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type AnnouncementRow = {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  image_url: string | null;
  type: string;
  created_at: number | null;
  author_id: string;
  author_name: string | null;
};

const SITE_URL = "https://miheen.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-share.jpg`;

function summary(text: string, max = 150) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

async function getAnnouncementById(id: string): Promise<AnnouncementRow | null> {
  if (!id) return null;
  const db = await ensureAnnouncementsTable();
  const row = await db
    .prepare(
      `SELECT
         a.id,
         a.title_ar,
         a.title_en,
         a.content_ar,
         a.content_en,
         a.image_url,
         a.type,
         a.author_id,
         a.created_at,
         u.name AS author_name
       FROM announcements a
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<AnnouncementRow>();
  return row ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const announcement = await getAnnouncementById(id);
  if (!announcement) {
    return {
      title: isAr ? "إعلان غير موجود | أرشيف مهين" : "Announcement Not Found | Mheen Archive",
      description: isAr ? "لم يتم العثور على الإعلان المطلوب." : "The requested announcement was not found.",
    };
  }

  const content = isAr
    ? announcement.content_ar || announcement.content_en || ""
    : announcement.content_en || announcement.content_ar || "";
  const desc = summary(
    content || (isAr ? "إعلان من بلدة مهين ضمن نشرة أخبار مهين." : "An announcement from Mheen News.")
  );
  const canonical = `${SITE_URL}/${locale}/pulse/${id}`;

  const newsPrefix = locale === "ar" ? "أخبار مهين | " : "Mheen News | ";
  const postTitle =
    locale === "ar"
      ? announcement.title_ar || announcement.title_en || "إعلان من بلدة مهين"
      : announcement.title_en || announcement.title_ar || "Announcement from Mheen";
  const fullTitle = `${newsPrefix}${postTitle}`;

  const dbImageUrl = announcement.image_url;
  let absoluteOgUrl = DEFAULT_OG_IMAGE;

  if (dbImageUrl) {
    const ogPath = toOgVariantUrl(dbImageUrl);
    absoluteOgUrl = ogPath.startsWith("http")
      ? ogPath
      : `${SITE_URL}${ogPath.startsWith("/") ? "" : "/"}${ogPath}`;
  }

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar/pulse/${id}`,
        en: `${SITE_URL}/en/pulse/${id}`,
        "x-default": `${SITE_URL}/ar/pulse/${id}`,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: fullTitle,
      description: desc,
      images: [
        {
          url: absoluteOgUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [absoluteOgUrl],
    },
    other: {
      itemprop: "image",
      image: absoluteOgUrl,
    },
  };
}

export default async function PulseDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  const title = isAr
    ? announcement.title_ar || announcement.title_en || "إعلان من بلدة مهين"
    : announcement.title_en || announcement.title_ar || "Announcement from Mheen";
  const author = announcement.author_name || (isAr ? "غير محدد" : "Unknown");
  const content = isAr
    ? announcement.content_ar || announcement.content_en || ""
    : announcement.content_en || announcement.content_ar || "";
  const published = announcement.created_at
    ? new Date(announcement.created_at * 1000).toISOString()
    : new Date().toISOString();
  const image = announcement.image_url || `${SITE_URL}/images/mheen-oasis-city.webp`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    author: { "@type": "Person", name: author },
    datePublished: published,
    dateModified: published,
    image: [image],
    inLanguage: isAr ? "ar" : "en",
    mainEntityOfPage: `${SITE_URL}/${locale}/pulse/${id}`,
    description: summary(content),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-qomra text-3xl font-bold text-primary md:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-foreground/60">
        {author} •{" "}
        {announcement.created_at
          ? new Date(announcement.created_at * 1000).toLocaleDateString(isAr ? "ar-SY" : "en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : ""}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AnnouncementShareButtons
          shareUrl={`${SITE_URL}/${locale}/pulse/${id}`}
          title={title}
          text={summary(content, 120)}
          isAr={isAr}
        />
      </div>
      {announcement.image_url && (
        <img
          src={announcement.image_url}
          alt={title}
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

