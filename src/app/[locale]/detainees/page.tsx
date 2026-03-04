export const runtime = "edge";

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getDB } from "@/lib/db";
import { DetaineesClient } from "@/components/DetaineesClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
};

type DetaineeRow = {
  id: string;
  name_ar: string;
  name_en: string;
  arrest_date: string | null;
  status_ar: string | null;
  status_en: string | null;
  image_url: string | null;
};

const SITE_URL = "https://miheen.com";
const DEFAULT_SHARE_IMAGE = "/default-share-image.jpg";
const DEFAULT_MARTYR_OG_IMAGE = "/images/default-martyr-og.jpg";

function summarize(text: string, max = 150) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}...` : s;
}

function resolveAbsoluteImage(raw: string | null) {
  const candidate = (raw || DEFAULT_SHARE_IMAGE).trim();
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
  if (candidate.startsWith("/")) return `${SITE_URL}${candidate}`;
  return `${SITE_URL}/${candidate}`;
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
    if (url.pathname.includes("-og.jpg")) {
      return url.toString();
    }
    return mainImageUrl;
  } catch {
    return toOgKeyOrPath(mainImageUrl);
  }
}

async function getDetainees(): Promise<DetaineeRow[]> {
  const db = await getDB();
  const res = await db
    .prepare(
      `SELECT id, name_ar, name_en, arrest_date, status_ar, status_en, image_url
       FROM detainees
       WHERE status = 'approved'
       ORDER BY arrest_date DESC, name_ar ASC`
    )
    .all<DetaineeRow>();
  return res.results ?? [];
}

async function getDetaineeById(id: string): Promise<DetaineeRow | null> {
  const db = await getDB();
  const row = await db
    .prepare(
      `SELECT id, name_ar, name_en, arrest_date, status_ar, status_en, image_url
       FROM detainees
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<DetaineeRow>();
  return row ?? null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { id } = await searchParams;
  const isAr = locale === "ar";

  if (!id) {
    return {
      title: isAr ? "سجل المعتقلين - أرشيف مهين" : "Detainees Register - Mheen Archive",
      description: isAr
        ? "سجل توثيقي لمعتقلي ومفقودي مهين مع إمكانيات بحث متقدمة."
        : "Documenting detainees and missing persons from Mheen with advanced search.",
    };
  }

  const detainee = await getDetaineeById(id);
  if (!detainee) {
    return {
      title: isAr ? "سجل المعتقلين - أرشيف مهين" : "Detainees Register - Mheen Archive",
      description: isAr
        ? "سجل توثيقي لمعتقلي ومفقودي مهين مع إمكانيات بحث متقدمة."
        : "Documenting detainees and missing persons from Mheen with advanced search.",
    };
  }

  const nameBase = isAr ? detainee.name_ar : detainee.name_en;
  const name = nameBase || (isAr ? "اسم غير متوفر" : "Unknown name");
  const status =
    isAr && (detainee.status_ar || detainee.status_en)
      ? detainee.status_ar || detainee.status_en
      : (!isAr && (detainee.status_en || detainee.status_ar)
          ? detainee.status_en || detainee.status_ar
          : null);

  const descBase = status
    ? `${isAr ? "حالة الاعتقال: " : "Detention status: "}${status}`
    : isAr
      ? "توثيق معتقل أو مفقود من بلدة مهين."
      : "A documented detainee or missing person from Mheen.";
  const description = summarize(descBase);

  const mainImageUrl = resolveAbsoluteImage(detainee.image_url);
  const ogImageUrl = detainee.image_url
    ? toOgVariantUrl(mainImageUrl)
    : resolveAbsoluteImage(DEFAULT_MARTYR_OG_IMAGE);
  console.log("OG URL Generated (detainees):", { mainImageUrl, ogImageUrl, id });

  const canonical = `${SITE_URL}/${locale}/detainees?id=${detainee.id}`;

  return {
    title: isAr
      ? `المعتقل ${name} | سجل المعتقلين - أرشيف مهين`
      : `Detainee ${name} | Detainees Register - Mheen Archive`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: isAr ? `المعتقل ${name}` : `Detainee ${name}`,
      description,
      url: canonical,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isAr ? `المعتقل ${name}` : `Detainee ${name}`,
      description,
      images: [ogImageUrl],
    },
    other: {
      itemprop: "image",
      image: ogImageUrl,
    },
  };
}

export default async function DetaineesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  await searchParams;
  setRequestLocale(locale);

  let detainees: DetaineeRow[] = [];
  try {
    detainees = await getDetainees();
  } catch {
    detainees = [];
  }

  return <DetaineesClient initialDetainees={detainees} locale={locale} />;
}
