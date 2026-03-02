"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X } from "lucide-react";
import Image from "next/image";

type BannerItem = {
  id: string;
  image_url: string;
  description_ar: string;
  description_en: string | null;
  date: string | null;
};

export function BannersArchive() {
  const t = useTranslations("pages.revolution");
  const locale = useLocale();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [lightbox, setLightbox] = useState<BannerItem | null>(null);

  useEffect(() => {
    fetch("/api/protest-banners")
      .then((r) => r.json())
      .then((d: { banners?: BannerItem[] }) => setBanners(d.banners ?? []))
      .catch(() => {});
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox]);

  if (banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <Flag className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
            {t("bannersTitle")}
          </h2>
        </div>
        <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-8 text-foreground/70">
          {t("bannersDesc")}
        </p>
      </motion.div>

      <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4">
        {banners.map((banner, i) => {
          const desc = locale === "en" ? (banner.description_en || banner.description_ar) : banner.description_ar;
          return (
            <motion.figure
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
              onClick={() => setLightbox(banner)}
            >
              <Image
                src={banner.image_url}
                alt={desc}
                width={400}
                height={500}
                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-8 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="line-clamp-2">{desc}</span>
              </figcaption>
            </motion.figure>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute end-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
              <Image
                src={lightbox.image_url}
                alt={lightbox.description_ar}
                width={1200}
                height={800}
                className="h-auto max-h-[70vh] w-full rounded-t-2xl object-contain"
                unoptimized
              />
              <div className="p-6">
                <p className="text-base font-medium leading-relaxed text-foreground">
                  {locale === "en"
                    ? (lightbox.description_en || lightbox.description_ar)
                    : lightbox.description_ar}
                </p>
                {lightbox.description_en && locale === "ar" && (
                  <p className="mt-2 text-sm text-foreground/60" dir="ltr">
                    {lightbox.description_en}
                  </p>
                )}
                {lightbox.date && (
                  <p className="mt-3 text-xs text-foreground/40">{lightbox.date}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
