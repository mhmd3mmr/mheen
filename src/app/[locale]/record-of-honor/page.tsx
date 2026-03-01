export const runtime = "edge";

import type { Metadata } from "next";
import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { RecordOfHonorClient } from "@/components/RecordOfHonorClient";

type Props = {
  params: Promise<{ locale: string }>;
};

type RecordsResponse = {
  records?: Array<{
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
  }>;
  hasMore?: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "سجل الخالدين - أرشيف مهين" : "Eternal Register - Mheen Archive",
    description: isAr
      ? "سجل موحد لتوثيق شهداء ومعتقلي مهين مع بحث وفلاتر فورية."
      : "Unified register documenting Mheen martyrs and detainees with instant search and filters.",
  };
}

export default async function RecordOfHonorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  let records: RecordsResponse["records"] = [];
  let hasMore = false;
  try {
    const res = await fetch(`${proto}://${host}/api/records/get-all?page=1`, {
      cache: "no-store",
    });
    const data = (await res.json()) as RecordsResponse;
    records = data.records ?? [];
    hasMore = !!data.hasMore;
  } catch {
    records = [];
    hasMore = false;
  }

  return <RecordOfHonorClient initialRecords={records ?? []} locale={locale} initialHasMore={hasMore} />;
}
