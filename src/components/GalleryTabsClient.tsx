"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Video, Share2, Copy, MessageCircle, Facebook, X, Play } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

type BannerItem = {
  id: string;
  image_url: string;
  description_ar: string;
  description_en: string | null;
  date: string | null;
};

type VideoItem = {
  id: string;
  youtube_url: string;
  title_ar: string;
  title_en: string | null;
  date: string | null;
};

type Pagination = {
  limit: number;
  offset: number;
  hasMore: boolean;
};

type PhotosResponse = {
  banners?: BannerItem[];
  pagination?: Pagination;
};

type VideosResponse = {
  videos?: VideoItem[];
  pagination?: Pagination;
};

const PAGE_SIZE = 20;

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export function GalleryTabsClient() {
  const t = useTranslations("pages.gallery");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");

  const [photos, setPhotos] = useState<BannerItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [photosHasMore, setPhotosHasMore] = useState(true);
  const [videosHasMore, setVideosHasMore] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);

  const [lightbox, setLightbox] = useState<BannerItem | null>(null);
  const [copyToast, setCopyToast] = useState("");

  async function fetchPhotos(offset: number) {
    setPhotosLoading(true);
    try {
      const res = await fetch(
        `/api/protest-banners?limit=${PAGE_SIZE}&offset=${offset}`
      );
      const data = (await res.json()) as PhotosResponse;
      const nextRows = data.banners ?? [];
      const hasMore = data.pagination?.hasMore ?? nextRows.length === PAGE_SIZE;
      setPhotos((prev) => (offset === 0 ? nextRows : [...prev, ...nextRows]));
      setPhotosHasMore(hasMore);
    } finally {
      setPhotosLoading(false);
    }
  }

  async function fetchVideos(offset: number) {
    setVideosLoading(true);
    try {
      const res = await fetch(
        `/api/protest-videos?limit=${PAGE_SIZE}&offset=${offset}`
      );
      const data = (await res.json()) as VideosResponse;
      const nextRows = data.videos ?? [];
      const hasMore = data.pagination?.hasMore ?? nextRows.length === PAGE_SIZE;
      setVideos((prev) => (offset === 0 ? nextRows : [...prev, ...nextRows]));
      setVideosHasMore(hasMore);
    } finally {
      setVideosLoading(false);
    }
  }

  useEffect(() => {
    void fetchPhotos(0);
  }, []);

  useEffect(() => {
    if (activeTab === "videos" && videos.length === 0 && !videosLoading) {
      void fetchVideos(0);
    }
  }, [activeTab, videos.length, videosLoading]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const lightboxTitle = useMemo(() => {
    if (!lightbox) return "";
    return locale === "en"
      ? lightbox.description_en || lightbox.description_ar
      : lightbox.description_ar;
  }, [lightbox, locale]);

  function getShareUrl(itemId: string) {
    if (typeof window === "undefined") return `https://miheen.com/${locale}/gallery`;
    return `${window.location.origin}/${locale}/gallery?photo=${itemId}`;
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyToast(t("copied"));
      setTimeout(() => setCopyToast(""), 2000);
    } catch {
      setCopyToast(t("copyFailed"));
      setTimeout(() => setCopyToast(""), 2000);
    }
  }

  return (
    <div className="min-h-[60vh] bg-background">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
        <div className="mx-auto mb-8 flex w-full max-w-xl rounded-xl border border-primary/10 bg-primary/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "photos"
                ? "bg-background text-primary shadow-sm"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            <Camera className="h-4 w-4" />
            {t("photosTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "videos"
                ? "bg-background text-primary shadow-sm"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            <Video className="h-4 w-4" />
            {t("videosTab")}
          </button>
        </div>

        {activeTab === "photos" ? (
          <>
            <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
              {photos.map((item) => {
                const desc =
                  locale === "en"
                    ? item.description_en || item.description_ar
                    : item.description_ar;
                return (
                  <figure
                    key={item.id}
                    className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
                    onClick={() => setLightbox(item)}
                  >
                    <img
                      src={item.image_url}
                      alt={desc}
                      className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </figure>
                );
              })}
            </div>

            {photosHasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => void fetchPhotos(photos.length)}
                  disabled={photosLoading}
                  className="rounded-xl border border-primary/20 bg-background px-6 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/5 disabled:opacity-60"
                >
                  {photosLoading ? "..." : t("loadMore")}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const ytId = extractYouTubeId(video.youtube_url);
                const title =
                  locale === "en"
                    ? video.title_en || video.title_ar
                    : video.title_ar;
                return (
                  <article
                    key={video.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-background shadow-sm"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      {ytId ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                          title={title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-200">
                          <Play className="h-10 w-10 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                        {title}
                      </h3>
                      {video.date && (
                        <p className="mt-1 text-xs text-foreground/50">{video.date}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {videosHasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => void fetchVideos(videos.length)}
                  disabled={videosLoading}
                  className="rounded-xl border border-primary/20 bg-background px-6 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/5 disabled:opacity-60"
                >
                  {videosLoading ? "..." : t("loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute end-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>

              <img
                src={lightbox.image_url}
                alt={lightboxTitle}
                className="h-auto max-h-[72vh] w-full object-contain"
              />

              <div className="space-y-4 p-5 md:p-6">
                <p className="text-base leading-relaxed text-foreground">{lightboxTitle}</p>
                {lightbox.date && (
                  <p className="text-xs text-foreground/50">{lightbox.date}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm text-foreground/70">
                    <Share2 className="h-4 w-4" />
                    {t("share")}
                  </span>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareUrl(lightbox.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs hover:bg-primary/5"
                  >
                    {t("shareWhatsapp")}
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(lightbox.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs hover:bg-primary/5"
                  >
                    {t("shareFacebook")}
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(lightbox.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs hover:bg-primary/5"
                  >
                    {t("shareX")}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyLink(getShareUrl(lightbox.id))}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-xs hover:bg-primary/5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {t("copyLink")}
                  </button>
                </div>

                {copyToast && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {copyToast}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
