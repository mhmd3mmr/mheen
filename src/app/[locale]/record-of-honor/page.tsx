export const runtime = "edge";

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getDB } from "@/lib/db";
import { RecordOfHonorClient } from "@/components/RecordOfHonorClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
};

type UnifiedRecordRow = {
  id: string;
  recordType: "martyr" | "detainee";
  name_ar: string;
  name_en: string;
  image_url: string | null;
  death_date?: string | null;
  birth_date?: string | null;
  martyrdom_method?: string | null;
  martyrdom_details?: string | null;
  tags?: string | null;
  arrest_date?: string | null;
  status_ar?: string | null;
  status_en?: string | null;
};

const SITE_URL = "https://miheen.com";
const PAGE_SIZE = 24;
const DEFAULT_SHARE_IMAGE = "/default-share-image.jpg";

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

async function getRecordsPageOne(): Promise<{ records: UnifiedRecordRow[]; hasMore: boolean }> {
  const db = await getDB();
  const martyrs = await db
    .prepare(
      `SELECT id, name_ar, name_en, image_url, death_date, birth_date, martyrdom_method, martyrdom_details, tags
       FROM martyrs
       WHERE status = 'approved'
       ORDER BY death_date DESC, name_ar ASC
       LIMIT ?`
    )
    .bind(PAGE_SIZE)
    .all<{
      id: string;
      name_ar: string;
      name_en: string;
      image_url: string | null;
      death_date: string | null;
      birth_date: string | null;
      martyrdom_method: string | null;
      martyrdom_details: string | null;
      tags: string | null;
    }>();

  const detainees = await db
    .prepare(
      `SELECT id, name_ar, name_en, image_url, arrest_date, status_ar, status_en, tags
       FROM detainees
       WHERE status = 'approved'
       ORDER BY arrest_date DESC, name_ar ASC
       LIMIT ?`
    )
    .bind(PAGE_SIZE)
    .all<{
      id: string;
      name_ar: string;
      name_en: string;
      image_url: string | null;
      arrest_date: string | null;
      status_ar: string | null;
      status_en: string | null;
      tags: string | null;
    }>();

  const records: UnifiedRecordRow[] = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(martyrs.results ?? []).map((m: any) => ({
      recordType: "martyr" as const,
      id: m.id,
      name_ar: m.name_ar,
      name_en: m.name_en,
      image_url: m.image_url,
      death_date: m.death_date,
      birth_date: m.birth_date,
      martyrdom_method: m.martyrdom_method,
      martyrdom_details: m.martyrdom_details,
      tags: m.tags,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(detainees.results ?? []).map((d: any) => ({
      recordType: "detainee" as const,
      id: d.id,
      name_ar: d.name_ar,
      name_en: d.name_en,
      image_url: d.image_url,
      arrest_date: d.arrest_date,
      status_ar: d.status_ar,
      status_en: d.status_en,
      tags: d.tags,
    })),
  ];

  return { records, hasMore: false };
}

async function getRecordById(id: string): Promise<UnifiedRecordRow | null> {
  const db = await getDB();
  const martyr = await db
    .prepare(
      `SELECT id, name_ar, name_en, image_url, death_date, birth_date, martyrdom_method, martyrdom_details, tags
       FROM martyrs
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<UnifiedRecordRow>();
  if (martyr) return { ...martyr, recordType: "martyr" };

  const detainee = await db
    .prepare(
      `SELECT id, name_ar, name_en, image_url, arrest_date, status_ar, status_en, tags
       FROM detainees
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<UnifiedRecordRow>();
  if (detainee) return { ...detainee, recordType: "detainee" };

  return null;
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
      title: isAr ? "سجل الخالدين - أرشيف مهين" : "Eternal Register - Mheen Archive",
      description: isAr
        ? "سجل موحد لتوثيق شهداء ومعتقلي مهين مع بحث وفلاتر فورية."
        : "Unified register documenting Mheen martyrs and detainees with instant search and filters.",
    };
  }

  const record = await getRecordById(id);
  if (!record) {
    return {
      title: isAr ? "سجل الخالدين - أرشيف مهين" : "Eternal Register - Mheen Archive",
      description: isAr
        ? "سجل موحد لتوثيق شهداء ومعتقلي مهين مع بحث وفلاتر فورية."
        : "Unified register documenting Mheen martyrs and detainees with instant search and filters.",
    };
  }

  const isMartyr = record.recordType === "martyr";
  const baseName = isAr ? record.name_ar : record.name_en;
  const name = baseName || (isAr ? "اسم غير متوفر" : "Unknown name");

  const rawSummary =
    record.recordType === "martyr"
      ? record.martyrdom_details || (isAr ? "توثيق شهيد من بلدة مهين." : "A documented martyr from Mheen.")
      : (isAr ? record.status_ar || record.status_en : record.status_en || record.status_ar) ||
        (isAr ? "توثيق معتقل/مفقود من بلدة مهين." : "A documented detainee/missing person from Mheen.");

  const summary = summarize(rawSummary);
  const mainImageUrl = resolveAbsoluteImage(record.image_url);
  const ogImageUrl = record.image_url ? toOgVariantUrl(mainImageUrl) : mainImageUrl;

  const canonical = `${SITE_URL}/${locale}/record-of-honor?id=${record.id}`;

  return {
    title: isMartyr
      ? `${isAr ? `الشهيد ${name}` : `Martyr ${name}`} | ${isAr ? "سجل الخالدين - أرشيف مهين" : "Record of Honor - Mheen Archive"}`
      : `${isAr ? `المعتقل ${name}` : `Detainee ${name}`} | ${isAr ? "سجل الخالدين - أرشيف مهين" : "Record of Honor - Mheen Archive"}`,
    description: summary,
    alternates: {
      canonical,
    },
    openGraph: {
      title: isMartyr ? (isAr ? `الشهيد ${name}` : `Martyr ${name}`) : isAr ? `المعتقل ${name}` : `Detainee ${name}`,
      description: summary,
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
      title: isMartyr ? (isAr ? `الشهيد ${name}` : `Martyr ${name}`) : isAr ? `المعتقل ${name}` : `Detainee ${name}`,
      description: summary,
      images: [ogImageUrl],
    },
    other: {
      itemprop: "image",
      image: ogImageUrl,
    },
  };
}

export default async function RecordOfHonorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { id } = await searchParams;
  setRequestLocale(locale);

  let records: UnifiedRecordRow[] = [];
  let hasMore = false;
  try {
    const page = await getRecordsPageOne();
    records = page.records;
    hasMore = page.hasMore;
    if (id) {
      const detail = await getRecordById(id);
      if (detail && !records.some((r) => r.id === detail.id && r.recordType === detail.recordType)) {
        records = [detail, ...records];
      }
    }
  } catch {
    records = [];
    hasMore = false;
  }

  return <RecordOfHonorClient initialRecords={records ?? []} locale={locale} initialHasMore={hasMore} />;
}
