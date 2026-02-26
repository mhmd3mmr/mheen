"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  User,
  Calendar,
  X,
  PenLine,
} from "lucide-react";

type StoryRow = {
  id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: number;
};

type Props = {
  initialStories: StoryRow[];
  locale: string;
};

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
    /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url)
  );
}

function StoryCard({ story, locale, index }: { story: StoryRow; locale: string; index: number }) {
  const t = useTranslations("pages.stories");
  const dateStr = formatStoryDate(story.created_at, locale);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-xl bg-background shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image Area */}
      <div className="relative h-56 w-full overflow-hidden bg-primary/5">
        {story.image_url && isImage(story.image_url) ? (
          <img
            src={story.image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookOpen className="h-14 w-14 text-primary/15" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Text over image */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <User className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">
              {story.author_name}
            </h3>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-300">
            <Calendar className="h-3 w-3" />
            {dateStr}
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex flex-1 flex-col p-6">
        <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/70 line-clamp-4">
          {story.content}
        </p>
        <Link
          href={`/stories`}
          className="mt-5 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          {t("readMore")}
        </Link>
      </div>
    </motion.article>
  );
}

export default function StoriesClient({ initialStories, locale }: Props) {
  const t = useTranslations("pages.stories");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery) return initialStories;
    const q = searchQuery.toLowerCase();
    return initialStories.filter(
      (s) =>
        s.author_name.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q)
    );
  }, [initialStories, searchQuery]);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 pb-32 pt-16 md:-mx-8 md:-mt-8 md:px-8 md:pb-36 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/80 via-primary to-primary" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-qomra text-4xl font-bold text-white md:text-5xl lg:text-6xl"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 max-w-lg text-base text-white/70 md:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-6 py-3 backdrop-blur-sm"
            >
              <BookOpen className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-white">
                {initialStories.length}
              </span>
              <span className="text-sm text-white/70">{t("total")}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-accent px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-accent/90"
              >
                <PenLine className="h-4 w-4" />
                {t("addStory")}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Bar - floating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 mx-auto -mt-8 max-w-2xl px-4"
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((story, i) => (
              <StoryCard
                key={story.id}
                story={story}
                locale={locale}
                index={i}
              />
            ))}
          </div>
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
    </div>
  );
}
