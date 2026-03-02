"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Play, Video } from "lucide-react";

type VideoItem = {
  id: string;
  youtube_url: string;
  title_ar: string;
  title_en: string | null;
  date: string | null;
};

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export function VideoGallery() {
  const t = useTranslations("pages.revolution");
  const locale = useLocale();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/protest-videos")
      .then((r) => r.json())
      .then((d: { videos?: VideoItem[] }) => setVideos(d.videos ?? []))
      .catch(() => {});
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
            <Video className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
            {t("videoGalleryTitle")}
          </h2>
        </div>
        <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-8 text-foreground/70">
          {t("videoGalleryDesc")}
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, i) => {
          const ytId = extractYouTubeId(video.youtube_url);
          const title = locale === "en" ? (video.title_en || video.title_ar) : video.title_ar;
          const isActive = activeId === video.id;

          return (
            <motion.article
              key={video.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-background shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                {isActive && ytId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button
                    onClick={() => setActiveId(video.id)}
                    className="relative block h-full w-full"
                  >
                    {ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200">
                        <Video className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                        <Play className="ms-0.5 h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{title}</h3>
                {video.date && (
                  <p className="mt-1 text-xs text-foreground/50">{video.date}</p>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
