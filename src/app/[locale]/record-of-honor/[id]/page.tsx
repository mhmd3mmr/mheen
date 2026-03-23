export const runtime = "edge";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type MartyrRow = {
  id: string;
  name_ar: string;
  name_en: string;
  birth_date: string | null;
  death_date: string | null;
  martyrdom_details: string | null;
  image_url: string | null;
  preview_image_url?: string | null;
  status: string;
};

type DetaineeRow = {
  id: string;
  name_ar: string;
  name_en: string;
  arrest_date: string | null;
  status_ar: string | null;
  status_en: string | null;
  image_url: string | null;
  preview_image_url?: string | null;
  status: string;
};

type HonorRecord =
  | ({ recordType: "martyr" } & MartyrRow)
  | ({ recordType: "detainee" } & DetaineeRow);

const SITE_URL = "https://miheen.com";
const DEFAULT_MARTYR_OG_IMAGE = `${SITE_URL}/images/default-martyr-og.jpg`;

function resolveAbsoluteImage(raw: string | null) {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${SITE_URL}${raw}`;
  return `${SITE_URL}/${raw}`;
}

/** Meta / WhatsApp expect HTTPS og:image and og:image:secure_url */
function ensureHttpsAbsolute(url: string) {
  if (!url) return url;
  if (url.startsWith("http://")) return `https://${url.slice("http://".length)}`;
  return url;
}

function toOgKeyOrPath(input: string) {
  const collapsed = input
    .replace(/-og(-og)+/gi, "-og")
    .replace(/\.(webp|png|jpe?g)(?=-og\.)/gi, "")
    .trim();
  if (/-og\.jpg$/i.test(collapsed)) return collapsed;
  if (/-og\.(webp|png|jpe?g)$/i.test(collapsed)) {
    return collapsed.replace(/-og\.(webp|png|jpe?g)$/i, "-og.jpg");
  }
  if (/\.(webp|png|jpe?g)$/i.test(collapsed)) {
    return collapsed.replace(/\.(webp|png|jpe?g)$/i, "-og.jpg");
  }
  return `${collapsed}-og.jpg`;
}

function toOgVariantUrl(mainImageUrl: string) {
  try {
    const url = new URL(mainImageUrl);
    const key = url.searchParams.get("key");
    if (key) {
      url.searchParams.set("key", toOgKeyOrPath(key));
      return url.toString();
    }
    url.pathname = toOgKeyOrPath(url.pathname);
    return url.toString();
  } catch {
    return toOgKeyOrPath(mainImageUrl);
  }
}

function textSummary(text: string, max = 160) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

async function getRecordById(id: string): Promise<HonorRecord | null> {
  const db = await getDB();
  const martyr = await db
    .prepare(
      `SELECT id, name_ar, name_en, birth_date, death_date, martyrdom_details, image_url, preview_image_url, status
       FROM martyrs
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<MartyrRow>();
  if (martyr) return { recordType: "martyr", ...martyr };

  const detainee = await db
    .prepare(
      `SELECT id, name_ar, name_en, arrest_date, status_ar, status_en, image_url, preview_image_url, status
       FROM detainees
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<DetaineeRow>();
  if (detainee) return { recordType: "detainee", ...detainee };

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const record = await getRecordById(id);
  if (!record) {
    return {
      title: isAr ? "سجل غير موجود | أرشيف مهين" : "Record Not Found | Mheen Archive",
      description: isAr ? "لم يتم العثور على السجل المطلوب." : "The requested record was not found.",
    };
  }

  const name = isAr ? record.name_ar : record.name_en;
  const summary =
    record.recordType === "martyr"
      ? record.martyrdom_details || (isAr ? "توثيق شهيد من بلدة مهين." : "A documented martyr from Mheen.")
      : (isAr ? record.status_ar || record.status_en : record.status_en || record.status_ar) ||
        (isAr ? "توثيق معتقل/مفقود من بلدة مهين." : "A documented detainee/missing person from Mheen.");

  const canonical = `${SITE_URL}/${locale}/record-of-honor/${id}`;
  const mainImageUrl = record.image_url ? resolveAbsoluteImage(record.image_url) : "";
  const ogImageUrlRaw = record.image_url ? toOgVariantUrl(mainImageUrl) : DEFAULT_MARTYR_OG_IMAGE;
  const previewUrlRaw = record.preview_image_url ? resolveAbsoluteImage(record.preview_image_url) : "";

  const ogImageUrl = ensureHttpsAbsolute(ogImageUrlRaw);
  const previewUrl = previewUrlRaw ? ensureHttpsAbsolute(previewUrlRaw) : "";

  const ogTitle =
    isAr && record.recordType === "martyr"
      ? `${name} | توثيق شهداء مهين`
      : `${name} | ${isAr ? "أرشيف مهين" : "Mheen Archive"}`;
  const ogDescription =
    isAr && record.recordType === "martyr"
      ? `توثيق الشهيد ${name} من بلدة مهين.`
      : textSummary(summary);

  // Primary OG image: small JPG preview for WhatsApp when available (actual file is 600×600 JPEG ≤300KB).
  const primaryOg = previewUrl || ogImageUrl;
  const primaryWidth = previewUrl ? 600 : 1200;
  const primaryHeight = previewUrl ? 600 : 630;

  const ogImages: NonNullable<Metadata["openGraph"]>["images"] = [
    {
      url: primaryOg,
      secureUrl: primaryOg,
      width: primaryWidth,
      height: primaryHeight,
      type: "image/jpeg",
      alt: name,
    },
  ];
  if (previewUrl) {
    ogImages.push({
      url: ogImageUrl,
      secureUrl: ogImageUrl,
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: name,
    });
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: ogTitle,
    description: ogDescription,
    keywords: isAr
      ? ["مهين", "سجل الخالدين", "شهداء مهين", "معتقلي مهين", "ريف حمص"]
      : ["Mheen", "record of honor", "Mheen martyrs", "Mheen detainees", "Homs countryside"],
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar/record-of-honor/${id}`,
        en: `${SITE_URL}/en/record-of-honor/${id}`,
        "x-default": `${SITE_URL}/ar/record-of-honor/${id}`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: isAr ? "بلدة مهين" : "Mheen",
      locale: isAr ? "ar_AR" : "en_US",
      title: ogTitle,
      description: ogDescription,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: isAr && record.recordType === "martyr" ? `توثيق شهيد من بلدة مهين.` : textSummary(summary),
      images: [ogImageUrl],
    },
    other: {
      itemprop: "image",
      image: ogImageUrl,
    },
  };
}

export default async function RecordDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const record = await getRecordById(id);
  if (!record) notFound();

  const name = isAr ? record.name_ar : record.name_en;
  const summary =
    record.recordType === "martyr"
      ? record.martyrdom_details || (isAr ? "توثيق شهيد من بلدة مهين." : "A documented martyr from Mheen.")
      : (isAr ? record.status_ar || record.status_en : record.status_en || record.status_ar) ||
        (isAr ? "توثيق معتقل/مفقود من بلدة مهين." : "A documented detainee/missing person from Mheen.");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description: textSummary(summary, 220),
    image: record.image_url || `${SITE_URL}/images/mheen-oasis-city.webp`,
    birthDate: record.recordType === "martyr" ? record.birth_date || undefined : undefined,
    deathDate: record.recordType === "martyr" ? record.death_date || undefined : undefined,
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-qomra text-3xl font-bold text-primary md:text-4xl">{name}</h1>
      <p className="mt-3 text-base leading-8 text-foreground/75">{summary}</p>
      {record.image_url && (
        <img
          src={record.image_url}
          alt={name || "صورة من أرشيف بلدة مهين"}
          className="mt-6 w-full rounded-2xl border border-primary/10 object-cover"
        />
      )}
    </main>
  );
}
