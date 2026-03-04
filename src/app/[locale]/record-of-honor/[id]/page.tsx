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
  status: string;
};

type HonorRecord =
  | ({ recordType: "martyr" } & MartyrRow)
  | ({ recordType: "detainee" } & DetaineeRow);

const SITE_URL = "https://miheen.com";

function textSummary(text: string, max = 160) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

async function getRecordById(id: string): Promise<HonorRecord | null> {
  const db = await getDB();
  const martyr = await db
    .prepare(
      `SELECT id, name_ar, name_en, birth_date, death_date, martyrdom_details, image_url, status
       FROM martyrs
       WHERE id = ? AND status = 'approved'
       LIMIT 1`
    )
    .bind(id)
    .first<MartyrRow>();
  if (martyr) return { recordType: "martyr", ...martyr };

  const detainee = await db
    .prepare(
      `SELECT id, name_ar, name_en, arrest_date, status_ar, status_en, image_url, status
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
  const image = record.image_url || `${SITE_URL}/images/mheen-oasis-city.webp`;

  return {
    title: `${name} | ${isAr ? "أرشيف مهين" : "Mheen Archive"}`,
    description: textSummary(summary),
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
      type: "profile",
      url: canonical,
      title: name,
      description: textSummary(summary),
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: textSummary(summary),
      images: [image],
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
