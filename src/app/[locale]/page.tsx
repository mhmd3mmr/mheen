export const runtime = 'edge';

import { setRequestLocale } from "next-intl/server";
import { getDB } from "@/lib/db";
import { HomepageClient } from "@/components/HomepageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let totalMartyrs = 0;
  let totalDetainees = 0;
  let totalStories = 0;
  let latestStories: any[] = [];

  try {
    const db = await getDB();
    const [martyrsRes, detaineesRes, storiesCountRes, latestRes] =
      await Promise.all([
        db
          .prepare("SELECT COUNT(*) as count FROM martyrs WHERE status = 'approved'")
          .first<{ count: number }>(),
        db
          .prepare("SELECT COUNT(*) as count FROM detainees WHERE status = 'approved'")
          .first<{ count: number }>(),
        db
          .prepare("SELECT COUNT(*) as count FROM stories WHERE status = 'approved'")
          .first<{ count: number }>(),
        db
          .prepare(
            "SELECT id, author_name, content, image_url, created_at FROM stories WHERE status = 'approved' ORDER BY id DESC LIMIT 3"
          )
          .all(),
      ]);

    totalMartyrs = martyrsRes?.count ?? 0;
    totalDetainees = detaineesRes?.count ?? 0;
    totalStories = storiesCountRes?.count ?? 0;
    latestStories = (latestRes?.results as any[]) ?? [];
  } catch (err) {
    console.warn("HomePage: D1 not available, using fallback data.", err);
  }

  return (
    <div className="flex flex-1 flex-col">
      <HomepageClient
        locale={locale}
        totalMartyrs={totalMartyrs}
        totalDetainees={totalDetainees}
        totalStories={totalStories}
        latestStories={latestStories}
      />
    </div>
  );
}
