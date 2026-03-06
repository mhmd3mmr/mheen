export const runtime = "edge";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { setRequestLocale } from "next-intl/server";
import { toOgVariantUrl } from "@/lib/og";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type PhotoRow = {
  id: string;
  image_url: string;
  description_ar: string | null;
  description_en: string | null;
  date: string | null;
};

const SITE_URL = "https://miheen.com";

function textSummary(text: string, max = 150) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

async function getPhotoById(id: string): Promise<PhotoRow | null> {
  const db = await getDB();
  const banner = await db
    .prepare(
      `SELECT id, image_url, description_ar, description_en, date
       FROM protest_banners
       WHERE id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<PhotoRow>();
  if (banner) return banner;

  const community = await db
    .prepare(
      `SELECT id, image_url, title_ar AS description_ar, title_en AS description_en, NULL as date
       FROM community_photos
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<PhotoRow>();
  return community ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const photo = await getPhotoById(id);
  if (!photo) {
    return {
      title: isAr ? "صورة غير موجودة | أرشيف مهين" : "Image Not Found | Mheen Archive",
      description: isAr ? "لم يتم العثور على الصورة المطلوبة." : "Requested image was not found.",
    };
  }

  const title = isAr
    ? photo.description_ar || photo.description_en || "صورة من أرشيف بلدة مهين"
    : photo.description_en || photo.description_ar || "Image from Mheen Archive";
  const canonical = `${SITE_URL}/${locale}/gallery/${id}`;

  const dbImageUrl = photo.image_url;
  const ogImages: Array<{ url: string; width: number; height: number; type: string }> = [];

  if (dbImageUrl) {
    const absoluteOgUrl = dbImageUrl.startsWith("http")
      ? dbImageUrl
      : `${SITE_URL}${dbImageUrl.startsWith("/") ? "" : "/"}${dbImageUrl}`;

    let verifiedUrl = absoluteOgUrl;
    let verifiedType = absoluteOgUrl.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg";

    try {
      const jpgVariantUrl = toOgVariantUrl(absoluteOgUrl);
      const response = await fetch(jpgVariantUrl, { method: "HEAD" });
      if (response.ok) {
        verifiedUrl = jpgVariantUrl;
        verifiedType = "image/jpeg";
      }
    } catch {
      // Silently keep raw URL (WebP for legacy images)
    }

    ogImages.push({
      url: verifiedUrl,
      width: 1200,
      height: 630,
      type: verifiedType,
    });
  }

  // Guaranteed JPG fallback for WhatsApp when primary is WebP or missing
  ogImages.push({
    url: `${SITE_URL}/images/default-share.jpg`,
    width: 1200,
    height: 630,
    type: "image/jpeg",
  });

  return {
    title: `${title} | ${isAr ? "أرشيف مهين" : "Mheen Archive"}`,
    description: textSummary(title),
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar/gallery/${id}`,
        en: `${SITE_URL}/en/gallery/${id}`,
        "x-default": `${SITE_URL}/ar/gallery/${id}`,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description: textSummary(title),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: textSummary(title),
      images: [ogImages[0].url],
    },
    other: {
      itemprop: "image",
      image: ogImages[0]?.url,
    },
  };
}

export default async function GalleryImagePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const photo = await getPhotoById(id);
  if (!photo) notFound();

  const desc = isAr
    ? photo.description_ar || photo.description_en || "صورة من أرشيف بلدة مهين"
    : photo.description_en || photo.description_ar || "Image from Mheen Archive";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: photo.image_url,
    description: desc,
    name: desc,
    uploadDate: photo.date || undefined,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-qomra text-3xl font-bold text-primary md:text-4xl">{desc}</h1>
      <img
        src={photo.image_url}
        alt={desc || "صورة من أرشيف بلدة مهين"}
        className="mt-6 w-full rounded-2xl border border-primary/10 object-contain"
      />
      {photo.date && <p className="mt-3 text-sm text-foreground/60">{photo.date}</p>}
    </main>
  );
}
