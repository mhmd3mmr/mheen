export const runtime = "edge";

import { setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import StoriesClient from "@/components/StoriesClient";

type Props = { params: Promise<{ locale: string }> };

export default async function StoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let stories: any[] = [];
  let hasMore = false;
  try {
    const h = await headers();
    const host = h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    const res = await fetch(`${proto}://${host}/api/stories?page=1`, { cache: "no-store" });
    const data = (await res.json()) as { stories?: any[]; hasMore?: boolean };
    stories = data.stories ?? [];
    hasMore = !!data.hasMore;
  } catch (err) {
    console.error("StoriesPage fetch error:", err);
  }

  return <StoriesClient initialStories={stories} locale={locale} initialHasMore={hasMore} />;
}
