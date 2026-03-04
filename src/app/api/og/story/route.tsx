export const runtime = "edge";

import { ImageResponse } from "next/og";
import { getDB } from "@/lib/db";

const SIZE = { width: 1200, height: 630 };
const SITE_URL = "https://miheen.com";

type StoryRow = {
  id: string;
  title_ar: string | null;
  title_en: string | null;
  image_url: string | null;
};

function toAbsoluteUrl(url: string | null) {
  if (!url) return `${SITE_URL}/images/mheen-oasis-city.webp`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url}`;
}

async function getStory(id: string) {
  const db = await getDB();
  const row = await db
    .prepare(
      `SELECT id, title_ar, title_en, image_url
       FROM stories
       WHERE status = 'approved' AND id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<StoryRow>();
  return row ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const locale = searchParams.get("locale") === "en" ? "en" : "ar";

  let title = locale === "ar" ? "قصة من أرشيف مهين" : "Story from Mheen Archive";
  let image = `${SITE_URL}/images/mheen-oasis-city.webp`;

  if (id) {
    const story = await getStory(id);
    if (story) {
      title =
        locale === "ar"
          ? story.title_ar || story.title_en || title
          : story.title_en || story.title_ar || title;
      image = toAbsoluteUrl(story.image_url);
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#0f172a",
          color: "#fff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.82) 75%, rgba(15,23,42,0.92) 100%)",
          }}
        />
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "38px 46px",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15 }}>{title}</div>
          <div style={{ fontSize: 30, opacity: 0.92 }}>
            {locale === "ar" ? "أرشيف مهين" : "Mheen Archive"}
          </div>
        </div>
      </div>
    ),
    SIZE
  );
}
