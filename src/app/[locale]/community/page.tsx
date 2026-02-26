"use client";

export const runtime = 'edge';

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import {
  Leaf,
  Wheat,
  HandHeart,
  Store,
  BriefcaseBusiness,
  TrainFront,
  Images,
  Sprout,
  Coffee,
} from "lucide-react";

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CommunityPage() {
  const t = useTranslations("pages.community");
  const locale = useLocale();
  const [galleryItems, setGalleryItems] = useState<
    { caption: string; image: string }[]
  >([]);

  const harvestBlocks = [
    {
      title: t("harvest1Title"),
      text: t("harvest1Text"),
      image: "/images/community-olive-grove.png",
      icon: Leaf,
    },
    {
      title: t("harvest2Title"),
      text: t("harvest2Text"),
      image: "/images/community-water-path.png",
      icon: Wheat,
    },
  ];

  const dailyCards = [
    {
      icon: HandHeart,
      title: t("daily1Title"),
      body: t("daily1Body"),
    },
    {
      icon: Store,
      title: t("daily2Title"),
      body: t("daily2Body"),
    },
    {
      icon: BriefcaseBusiness,
      title: t("daily3Title"),
      body: t("daily3Body"),
    },
  ];

  useEffect(() => {
    let mounted = true;
    fetch("/api/community-photos")
      .then((res) => res.json())
      .then((data: {
        photos?: Array<{
          id: string;
          title: string;
          title_ar?: string | null;
          title_en?: string | null;
          image_url: string;
        }>;
      }) => {
        if (!mounted) return;
        const rows = data.photos ?? [];
        if (rows.length > 0) {
          setGalleryItems(
            rows.map((r) => ({
              caption:
                locale === "ar"
                  ? r.title_ar || r.title_en || r.title
                  : r.title_en || r.title_ar || r.title,
              image: r.image_url,
            }))
          );
          return;
        }
        setGalleryItems([
          {
            caption: t("galleryCap1"),
            image:
              "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap2"),
            image:
              "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap3"),
            image:
              "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap4"),
            image:
              "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80&sat=-50",
          },
          {
            caption: t("galleryCap5"),
            image:
              "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80&sat=-30",
          },
          {
            caption: t("galleryCap6"),
            image:
              "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80&sat=-35",
          },
          {
            caption: t("galleryCap7"),
            image:
              "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap8"),
            image:
              "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
        ]);
      })
      .catch(() => {
        if (!mounted) return;
        setGalleryItems([]);
      });
    return () => {
      mounted = false;
    };
  }, [t, locale]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden md:-mx-8 md:-mt-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1800&q=80')",
            filter: "sepia(0.45) saturate(0.85)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/75 via-stone-900/65 to-amber-950/75" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.65) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8 md:py-32">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-black/15 px-4 py-1.5 text-sm text-amber-100 backdrop-blur">
              <Sprout className="h-4 w-4" />
              {t("eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-3xl text-start font-qomra text-5xl font-bold text-amber-50 md:text-6xl">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-3xl text-start text-lg leading-relaxed text-stone-100/90 md:text-xl">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* People, Customs & Traditions */}
      <section className="w-full bg-[#fdfbf7] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mx-auto inline-flex rounded-full bg-amber-100 p-3 text-amber-700">
              <Coffee className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-center font-qomra text-3xl font-bold text-primary md:text-4xl">
              {t("peopleTitle")}
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-center text-lg font-medium leading-relaxed text-gray-700 md:text-xl">
              {t("peopleText")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Harvest & Land */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10 flex items-center gap-3 text-start">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <Leaf className="h-5 w-5" />
            </div>
            <h2 className="font-qomra text-3xl font-bold text-primary">
              {t("harvestSectionTitle")}
            </h2>
          </div>
        </Reveal>

        <div className="space-y-10">
          {harvestBlocks.map((block, i) => {
            const reverse = i % 2 === 1;
            const Icon = block.icon;
            return (
              <Reveal key={block.title} delay={i * 0.08}>
                <article className="rounded-3xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur md:p-8">
                  <div
                    className={`grid items-center gap-6 md:grid-cols-2 ${
                      reverse ? "md:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="text-start">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                        <Icon className="h-4 w-4" />
                        {t("harvestTag")}
                      </div>
                      <h3 className="font-qomra text-2xl font-semibold text-stone-800">
                        {block.title}
                      </h3>
                      <p className="mt-4 leading-8 text-stone-700">{block.text}</p>
                    </div>

                    <div className="relative h-72 overflow-hidden rounded-2xl">
                      <img
                        src={block.image}
                        alt={block.title}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Daily Life & Diaspora */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-start font-qomra text-3xl font-bold text-primary">
            {t("dailyTitle")}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {dailyCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 0.08}>
                <article className="h-full rounded-2xl border border-stone-200 bg-stone-50 p-6 text-start shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-qomra text-2xl font-semibold text-stone-800">
                    {card.title}
                  </h3>
                  <p className="mt-3 leading-8 text-stone-700">{card.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Train Station Callout */}
      <section className="relative mx-0 mt-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1800&q=80')",
            filter: "grayscale(0.35) sepia(0.3)",
          }}
        />
        <div className="absolute inset-0 bg-stone-900/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <Reveal>
            <div className="max-w-3xl text-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-100/10 px-4 py-1.5 text-sm text-amber-100">
                <TrainFront className="h-4 w-4" />
                {t("trainTag")}
              </span>
              <h2 className="mt-5 font-qomra text-4xl font-bold text-amber-50">
                {t("trainTitle")}
              </h2>
              <p className="mt-4 text-lg leading-8 text-stone-100/90">
                {t("trainText")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Memory Gallery */}
      <section className="mx-auto mt-20 max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="text-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm text-amber-800">
              <Images className="h-4 w-4" />
              {t("galleryTag")}
            </div>
            <h2 className="mt-4 font-qomra text-4xl font-bold text-primary">
              {t("galleryTitle")}
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-stone-700">
              {t("gallerySubtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
          {galleryItems.map((item, i) => (
            <Reveal key={item.caption} delay={i * 0.05} className="break-inside-avoid">
              <figure className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
                <img
                  src={item.image}
                  alt={item.caption}
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent px-4 pb-4 pt-8 text-sm text-stone-100">
                  {item.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 text-start">
            <Link
              href="/submit-community-photo"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-background transition-colors hover:bg-primary/90"
            >
              {t("shareButton")}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
