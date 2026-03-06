export const runtime = "edge";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { ensureAnnouncementsTable } from "@/lib/api/announcements";
import { getDB } from "@/lib/db";
import { toOgVariantUrl } from "@/lib/og";
import { PageHeader } from "@/components/PageHeader";
import { AnnouncementShareButtons } from "@/components/AnnouncementShareButtons";
import { Share2, Clock, AlertTriangle, HeartPulse, Megaphone } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type AnnouncementRow = {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  image_url: string | null;
  type: string;
  created_at: number;
  author_id: string;
  author_name: string | null;
};

const SITE_URL = "https://miheen.com";
const DEFAULT_SHARE_IMAGE = "/images/default-share.jpg";
const PAGE_SIZE = 30;

function summarize(text: string, max = 150) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function resolveAbsoluteImage(raw: string | null) {
  const candidate = (raw || DEFAULT_SHARE_IMAGE).trim();
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
  if (candidate.startsWith("/")) return `${SITE_URL}${candidate}`;
  return `${SITE_URL}/${candidate}`;
}

async function getAnnouncementsPageOne(): Promise<AnnouncementRow[]> {
  const db = await ensureAnnouncementsTable();
  const { results } = await db
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
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET 0`
    )
    .bind(PAGE_SIZE)
    .all<AnnouncementRow>();
  return results ?? [];
}

async function getAnnouncementByIdForMeta(id: string): Promise<AnnouncementRow | null> {
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const rawId = resolvedSearchParams?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
  const isAr = locale === "ar";

  if (!id || !id.trim()) {
    return {
      title: isAr ? "أخبار مهين – الإعلانات والأخبار" : "Mheen News – Town Announcements",
      description: isAr
        ? "إعلانات عاجلة وأخبار عامة عن بلدة مهين."
        : "Urgent notices and community news from Mheen.",
      openGraph: {
        title: isAr ? "أخبار مهين – الإعلانات والأخبار" : "Mheen News – Town Announcements",
        description: isAr
          ? "إعلانات عاجلة وأخبار عامة عن بلدة مهين."
          : "Urgent notices and community news from Mheen.",
        images: [
          {
            url: `${SITE_URL}${DEFAULT_SHARE_IMAGE}`,
            width: 1200,
            height: 630,
            type: "image/jpeg",
          },
        ],
      },
    };
  }

  let announcement: AnnouncementRow | null = null;
  try {
    announcement = await getAnnouncementByIdForMeta(id.trim());
  } catch (err) {
    console.error("Error fetching announcement for metadata:", err);
  }

  if (!announcement) {
    return {
      title: isAr ? "إعلان غير موجود | أرشيف مهين" : "Announcement Not Found | Mheen Archive",
      description: isAr ? "لم يتم العثور على الإعلان المطلوب." : "The requested announcement was not found.",
    };
  }

  const titleLocalized = isAr
    ? announcement.title_ar || announcement.title_en
    : announcement.title_en || announcement.title_ar;
  const bodyLocalized = isAr
    ? announcement.content_ar || announcement.content_en || ""
    : announcement.content_en || announcement.content_ar || "";

  const title = titleLocalized || (isAr ? "إعلان من بلدة مهين" : "Announcement from Mheen");
  const description = summarize(
    bodyLocalized || (isAr ? "إعلان من بلدة مهين ضمن نشرة أخبار مهين." : "An announcement from Mheen News.")
  );

  const mainImageUrl = resolveAbsoluteImage(announcement.image_url);
  const ogVariant = announcement.image_url ? toOgVariantUrl(mainImageUrl) : mainImageUrl;
  const ogUrl = ogVariant.startsWith("http") ? ogVariant : `${SITE_URL}${ogVariant}`;

  const images: NonNullable<Metadata["openGraph"]>["images"] = [
    {
      url: ogUrl,
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: title,
    },
    {
      url: `${SITE_URL}${DEFAULT_SHARE_IMAGE}`,
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: "Mheen Archive",
    },
  ];

  const canonical = `${SITE_URL}/${locale}/pulse?id=${announcement.id}`;

  return {
    title: `${title} | ${isAr ? "أرشيف مهين" : "Mheen Archive"}`,
    description,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar/pulse?id=${announcement.id}`,
        en: `${SITE_URL}/en/pulse?id=${announcement.id}`,
        "x-default": `${SITE_URL}/ar/pulse?id=${announcement.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
    other: {
      itemprop: "image",
      image: ogUrl,
    },
  };
}

export default async function PulsePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const rawId = resolvedSearchParams?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
  const deepLinkedId = id?.trim() || undefined;

  setRequestLocale(locale);
  const isAr = locale === "ar";

  let announcements: AnnouncementRow[] = [];
  try {
    announcements = await getAnnouncementsPageOne();
  } catch (err) {
    console.error("PulsePage announcements fetch error:", err);
  }

  // Prefer deep-linked item at top if not already present
  if (deepLinkedId) {
    try {
      const db = await getDB();
      const deepLinked = await db
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
        .bind(deepLinkedId)
        .first<AnnouncementRow>();
      if (deepLinked && !announcements.some((a) => a.id === deepLinked.id)) {
        announcements = [deepLinked, ...announcements];
      }
    } catch (err) {
      console.error("PulsePage deep-link fetch error:", err);
    }
  }

  const baseUrl =
    typeof window === "undefined"
      ? SITE_URL
      : (headers().get("x-forwarded-proto") ?? "https") +
        "://" +
        (headers().get("x-forwarded-host") ?? headers().get("host") ?? "miheen.com");

  function typeBadge(type: string) {
    switch (type) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
            <AlertTriangle className="h-3 w-3" />
            {isAr ? "عاجل" : "Urgent"}
          </span>
        );
      case "obituary":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-50">
            <HeartPulse className="h-3 w-3" />
            {isAr ? "نعوة / تأبين" : "Obituary"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            {isAr ? "عام" : "General"}
          </span>
        );
    }
  }

  function formatDate(ts: number) {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString(isAr ? "ar-SY" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function buildCanonicalUrl(id: string) {
    return `${baseUrl}/${locale}/pulse/${id}`;
  }

  return (
    <div className="min-h-[60vh] bg-background">
      <PageHeader
        title={isAr ? "أخبار مهين" : "Mheen News"}
        subtitle={
          isAr
            ? "مساحة حيّة للإعلانات العاجلة والأخبار المجتمعية من مهين."
            : "A live stream of urgent notices and community news from Mheen."
        }
      />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {announcements.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-primary/20 bg-background/70 p-8 text-center text-sm text-foreground/60">
            {isAr ? "لا توجد إعلانات حالياً." : "No announcements yet."}
          </p>
        ) : (
          <ol className="relative border-s border-primary/10 pl-5">
            <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-background">
              <Megaphone className="h-4 w-4" />
            </span>
            {announcements.map((a, index) => (
              <li key={a.id} className="mb-8 ms-4 last:mb-0">
                <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary" />
                <article className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                  <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        {isAr ? (a.title_ar || a.title_en) : (a.title_en || a.title_ar)}
                      </h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-foreground/60">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(a.created_at)}</span>
                        {a.author_name && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{a.author_name}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {typeBadge(a.type)}
                    </div>
                  </header>

                  {a.image_url && (
                    <img
                      src={a.image_url}
                      alt={isAr ? (a.title_ar || a.title_en) || "" : (a.title_en || a.title_ar) || ""}
                      className="mt-3 w-full rounded-xl border border-primary/10 object-cover"
                    />
                  )}

                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                    {summarize(
                      isAr ? (a.content_ar || a.content_en || "") : (a.content_en || a.content_ar || ""),
                      260
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={`/pulse/${a.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-1.5 text-xs text-primary hover:bg-primary/5"
                    >
                      {isAr ? "عرض كامل" : "View full"}
                    </a>
                    <AnnouncementShareButtons
                      shareUrl={buildCanonicalUrl(a.id)}
                      title={isAr ? (a.title_ar || a.title_en) || "" : (a.title_en || a.title_ar) || ""}
                      text={summarize(
                        isAr ? (a.content_ar || a.content_en || "") : (a.content_en || a.content_ar || ""),
                        120
                      )}
                      isAr={isAr}
                    />
                    <span className="inline-flex items-center gap-1 text-[11px] text-foreground/50">
                      <Share2 className="h-3 w-3" />
                      {isAr ? `إعلان رقم ${announcements.length - index}` : `Announcement #${announcements.length - index}`}
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}

