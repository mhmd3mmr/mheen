export const runtime = "edge";

import { setRequestLocale } from "next-intl/server";
import { getDB } from "@/lib/db";
import StoriesClient from "@/components/StoriesClient";

type Props = { params: Promise<{ locale: string }> };

export default async function StoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let stories: any[] = [];
  try {
    const db = await getDB();
    const { results } = await db
      .prepare(
        `SELECT id, author_name, content, image_url, created_at
         FROM stories
         WHERE status = 'approved'
         ORDER BY id DESC`
      )
      .all();
    stories = (results ?? []) as any[];
  } catch (err) {
    console.error("StoriesPage fetch error:", err);
  }

  return <StoriesClient initialStories={stories} locale={locale} />;
}
