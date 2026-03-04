"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import {
  BookOpen,
  Search,
  User,
  Calendar,
  X,
  PenLine,
  Share2,
  Clock3,
} from "lucide-react";

export type StoryRow = {
  id: string;
  author_name?: string | null;
  author_ar?: string | null;
  author_en?: string | null;
  title_ar?: string | null;
  title_en?: string | null;
  category?: "history" | "memories" | "figures" | "other" | null;
  content?: string | null;
  content_ar?: string | null;
  content_en?: string | null;
  tags?: string | null;
  image_url: string | null;
  created_at: number;
};

type Props = {
  initialStories: StoryRow[];
  locale: string;
  initialHasMore: boolean;
};

const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACwAQCdASoQABAAPm02mUmkIyKhIggAgA2JaW7hdAAP7v2mAA==";

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function toArabicDigits(input: string) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return input.replace(/\d/g, (d) => map[Number(d)]);
}

function formatStoryDate(createdAtSeconds: number, locale: string) {
  const d = new Date(createdAtSeconds * 1000);
  const day = d.getUTCDate();
  const monthIndex = d.getUTCMonth();
  const year = d.getUTCFullYear();

  if (locale === "ar") {
    return `${toArabicDigits(String(day))} ${AR_MONTHS[monthIndex]} ${toArabicDigits(
      String(year)
    )}`;
  }

  return `${EN_MONTHS[monthIndex]} ${day}, ${year}`;
}

function isImage(url: string | null) {
  if (!url) return false;
  return (
    url.startsWith("data:image") ||
    url.includes("/api/upload?key=") ||
    /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(url)
  );
}

function normalizeImageSrc(url: string) {
  try {
    const parsed = new URL(url);
    if (
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      parsed.pathname.startsWith("/api/upload")
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function StoryCard({
  story,
  locale,
  index,
  onReadMore,
}: {
  story: StoryRow;
  locale: string;
  index: number;
  onReadMore: () => void;
}) {
  const t = useTranslations("pages.stories");
  const dateStr = formatStoryDate(story.created_at, locale);
  const isAr = locale === "ar";
  const title = isAr ? story.title_ar || story.title_en || "" : story.title_en || story.title_ar || "";
  const author = isAr
    ? story.author_ar || story.author_en || story.author_name || ""
    : story.author_en || story.author_ar || story.author_name || "";
  const excerpt = isAr
    ? story.content_ar || story.content_en || story.content || ""
    : story.content_en || story.content_ar || story.content || "";
  const fallbackTitle = t("untitledStory");
  const storyTitle = title || fallbackTitle;
  const words = excerpt.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const minutesLabel = isAr ? toArabicDigits(String(minutes)) : String(minutes);
  const readingTime = t("readingTime", { minutes: minutesLabel });
  const categoryMap = {
    history: t("categoryHistory"),
    memories: t("categoryMemories"),
    figures: t("categoryFigures"),
    other: t("categoryOther"),
  } as const;
  const categoryLabel = categoryMap[(story.category ?? "other") as keyof typeof categoryMap];

  async function handleShare() {
    const shareUrl = `https://miheen.com/${locale}/stories#story-${story.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: storyTitle,
          text: excerpt.slice(0, 140),
          url: shareUrl,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Ignore cancelled shares and clipboard permission errors.
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      id={`story-${story.id}`}
      className="group flex h-[460px] flex-col overflow-hidden rounded-xl bg-background shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-primary/5">
        {story.image_url && isImage(story.image_url) ? (
          <Image
            src={normalizeImageSrc(story.image_url)}
            alt={storyTitle || "صورة من أرشيف بلدة مهين"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            priority={index < 6}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookOpen className="h-14 w-14 text-primary/15" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-2 start-2 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {categoryLabel}
        </div>

        {/* Text over image */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <User className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">
              {author}
            </h3>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-300">
            <Calendar className="h-3 w-3" />
            <span>{dateStr}</span>
            <span>{readingTime}</span>
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-1 text-lg font-bold text-foreground">{storyTitle}</h3>
        <p className="mt-2 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/70 line-clamp-2">
          {excerpt}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onReadMore}
            className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            {t("readMore")}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label={t("share")}
            className="ms-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 text-foreground/70 transition-colors hover:bg-primary/5"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function StoriesClient({ initialStories, locale, initialHasMore }: Props) {
  const t = useTranslations("pages.stories");
  const [selectedStory, setSelectedStory] = useState<StoryRow | null>(null);
  const [stories, setStories] = useState(initialStories);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery) return stories;
    const q = searchQuery.toLowerCase();
    return stories.filter(
      (s) =>
        (s.author_ar || s.author_name || "").toLowerCase().includes(q) ||
        (s.author_en || "").toLowerCase().includes(q) ||
        (s.title_ar || "").toLowerCase().includes(q) ||
        (s.title_en || "").toLowerCase().includes(q) ||
        (s.content_ar || s.content || "").toLowerCase().includes(q) ||
        (s.content_en || "").toLowerCase().includes(q)
    );
  }, [stories, searchQuery]);

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await fetch(`/api/stories?page=${nextPage}`);
      const data = (await res.json()) as { stories?: StoryRow[]; hasMore?: boolean };
      const nextStories = data.stories ?? [];
      setStories((prev) => {
        const seen = new Set(prev.map((s) => s.id));
        const appended = nextStories.filter((s) => !seen.has(s.id));
        return [...prev, ...appended];
      });
      setCurrentPage(nextPage);
      setHasMore(!!data.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="overflow-x-hidden">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Search + Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto max-w-3xl px-4 py-8"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{stories.length}</span>
            <span className="text-sm text-foreground/60">{t("total")}</span>
          </div>
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <PenLine className="h-4 w-4" />
            {t("addStory")}
          </Link>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-auto max-w-2xl px-4"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-background p-3 shadow-lg">
          <Search className="ms-2 h-5 w-5 shrink-0 text-foreground/40" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-primary/5 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Stories Grid */}
      <section className="mx-auto mt-10 max-w-6xl px-4 pb-16 md:pb-20">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((story, i) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  locale={locale}
                  index={i}
                  onReadMore={() => setSelectedStory(story)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="rounded-lg border border-primary/20 bg-background px-4 py-2 text-sm text-foreground/80 hover:bg-primary/5 disabled:opacity-60"
                >
                  {isLoadingMore ? t("loadingMore") : t("loadMore")}
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-foreground/15" />
            <p className="text-lg text-foreground/40">
              {searchQuery ? t("noResults") : t("noStories")}
            </p>
          </motion.div>
        )}
      </section>
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          locale={locale}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}

export function StoryModal({
  story,
  locale,
  onClose,
}: {
  story: StoryRow;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("pages.stories");
  const isAr = locale === "ar";
  const title = isAr ? story.title_ar || story.title_en || "" : story.title_en || story.title_ar || "";
  const author = isAr
    ? story.author_ar || story.author_en || story.author_name || ""
    : story.author_en || story.author_ar || story.author_name || "";
  const fullContent = isAr
    ? story.content_ar || story.content_en || story.content || ""
    : story.content_en || story.content_ar || story.content || "";
  const dateStr = formatStoryDate(story.created_at, locale);
  const words = fullContent.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const minutesLabel = isAr ? toArabicDigits(String(minutes)) : String(minutes);
  const readingTime = t("readingTime", { minutes: minutesLabel });
  const categoryMap = {
    history: t("categoryHistory"),
    memories: t("categoryMemories"),
    figures: t("categoryFigures"),
    other: t("categoryOther"),
  } as const;
  const categoryLabel = categoryMap[(story.category ?? "other") as keyof typeof categoryMap];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true">
      <div className="relative mx-auto flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl bg-white/50 p-0 shadow-2xl dark:bg-slate-900 md:rounded-3xl lg:flex-row lg:overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 z-50 rounded-full bg-white/80 p-2 text-gray-800 shadow-sm backdrop-blur transition-all hover:bg-white"
          aria-label={t("close")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative h-64 w-full shrink-0 lg:sticky lg:top-0 lg:h-auto lg:w-2/5 xl:w-1/2">
            {story.image_url && isImage(story.image_url) ? (
              <Image
                src={normalizeImageSrc(story.image_url)}
                alt={title || t("untitledStory") || "صورة من أرشيف بلدة مهين"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={85}
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/5">
                <BookOpen className="h-16 w-16 text-primary/20" />
              </div>
            )}
            <span className="absolute top-3 start-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {categoryLabel}
            </span>
          </div>

          <div className="flex-1 p-6 md:p-10 lg:overflow-y-auto lg:p-12">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-slate-100 md:text-4xl">
                {title || t("untitledStory")}
              </h2>
              <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {author}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateStr}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {readingTime.replace(/^•\s*/, "")}
                </span>
              </div>

              <div className="space-y-6 text-start text-base leading-loose text-gray-700 md:text-lg dark:text-slate-200">
                {fullContent
                  .split("\n")
                  .filter((line) => line.trim().length > 0)
                  .map((paragraph, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
