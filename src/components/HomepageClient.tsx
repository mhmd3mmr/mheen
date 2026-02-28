"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  BookOpen,
  PenLine,
  Users,
  ArrowRight,
  ArrowLeft,
  User,
  MapPin,
  Droplets,
} from "lucide-react";

type StoryRow = {
  id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: number;
};

type Props = {
  locale: string;
  totalMartyrs: number;
  totalDetainees: number;
  totalStories: number;
  latestStories: StoryRow[];
  heroSlides: {
    id: string;
    image_url: string | null;
    desktop_url: string | null;
    mobile_url: string | null;
    title_ar: string | null;
    title_en: string | null;
    is_active: number;
    sort_order: number;
  }[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HomepageClient({
  locale,
  latestStories,
  heroSlides,
}: Props) {
  const t = useTranslations("Hero");
  const h = useTranslations("Home");
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [activeSlide, setActiveSlide] = useState(0);
  const [hideScrollCue, setHideScrollCue] = useState(false);

  const slides = useMemo(() => {
    const fromAdmin = heroSlides
      .filter((s) => s.is_active === 1 && (s.desktop_url || s.image_url || s.mobile_url))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        id: s.id,
        desktopImage: s.desktop_url || s.image_url || s.mobile_url || "",
        mobileImage: s.mobile_url || s.desktop_url || s.image_url || "",
        caption: isAr ? s.title_ar || "" : s.title_en || "",
      }));

    if (fromAdmin.length > 0) return fromAdmin;
    return [
      { id: "fallback-1", desktopImage: "/images/mheen-hero.jpg", mobileImage: "/images/mheen-hero.jpg", caption: "" },
      { id: "fallback-2", desktopImage: "/images/mheen-oasis.jpg", mobileImage: "/images/mheen-oasis.jpg", caption: "" },
    ];
  }, [heroSlides, isAr]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setActiveSlide(0);
  }, [slides.length]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 8) setHideScrollCue(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pillars = [
    {
      title: h("pillar1Title"),
      desc: h("pillar1Desc"),
      href: "/martyrs",
      icon: Shield,
      className: "md:row-span-2 md:col-span-1 bg-primary text-white",
      iconBg: "bg-white/15",
    },
    {
      title: h("pillar2Title"),
      desc: h("pillar2Desc"),
      href: "/about-mheen",
      icon: BookOpen,
      className: "md:col-span-2 bg-amber-50 border border-amber-100",
      iconBg: "bg-amber-200/60",
    },
    {
      title: h("pillar3Title"),
      desc: h("pillar3Desc"),
      href: "/stories",
      icon: Users,
      className: "bg-sky-50 border border-sky-100",
      iconBg: "bg-sky-200/60",
    },
    {
      title: h("pillar4Title"),
      desc: h("pillar4Desc"),
      href: "/submit",
      icon: PenLine,
      className: "bg-white border border-gray-200 shadow-sm",
      iconBg: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ─── Hero: Balanced welcome height ─── */}
      <section className="relative flex min-h-screen items-end overflow-hidden px-4 py-10 sm:py-12 md:py-12">
        {slides[0] && (
          <link
            rel="preload"
            as="image"
            href={slides[0].desktopImage}
            imageSrcSet={`${slides[0].mobileImage} 1200w, ${slides[0].desktopImage} 1920w`}
            imageSizes="100vw"
          />
        )}
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {i === 0 || i === activeSlide ? (
              <picture>
                <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                <source media="(min-width: 769px)" srcSet={slide.desktopImage} />
                <img
                  src={slide.desktopImage}
                  alt="Mheen Hero"
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  sizes="100vw"
                />
              </picture>
            ) : (
              <div className="h-full w-full bg-primary/20" />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/35" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 pt-4 text-start sm:pb-16 md:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-4 text-sm font-medium uppercase text-white/70 ${isAr ? "tracking-normal" : "tracking-[0.2em]"} max-w-xl`}
          >
            {t("eyebrow")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`max-w-3xl font-qomra text-5xl font-bold text-white sm:text-6xl md:text-7xl lg:text-8xl ${isAr ? "tracking-normal" : "tracking-[0.22em]"}`}
          >
            {t("mainTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl"
          >
            {t("subtitle")}
          </motion.p>
          {slides[activeSlide]?.caption ? (
            <p className="mt-3 max-w-xl text-sm text-white/75">{slides[activeSlide].caption}</p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-3 sm:mt-12 sm:gap-4"
          >
            <Link
              href="/about-mheen"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/95 hover:shadow-xl"
            >
              {t("ctaDiscover")}
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/martyrs"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 bg-white/5 px-6 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/15"
            >
              {t("ctaArchive")}
            </Link>
          </motion.div>

          {slides.length > 1 ? (
            <div className="mt-6 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  aria-label={`slide-${i + 1}`}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === activeSlide ? "w-7 bg-white" : "w-2.5 bg-white/55"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Scroll-down indicator (no text) */}
        {!hideScrollCue && (
          <button
            type="button"
            aria-label="Scroll down"
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.92, behavior: "smooth" })}
            className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full p-1 text-white/85 transition-colors hover:text-white"
          >
            <div className="relative flex h-8 w-5 items-start justify-center rounded-full border border-white/60">
              <motion.span
                animate={{ y: [4, 18, 4], opacity: [0.95, 0.35, 0.95] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="mt-1 h-1 w-1 rounded-full bg-white"
              />
            </div>
          </button>
        )}
      </section>

      {/* ─── Oasis Showcase ─── */}
      <section className="relative z-10 bg-neutral-50 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center font-qomra text-3xl font-bold text-primary md:text-4xl"
          >
            {h("oasisTitle")}
          </motion.h2>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: isAr ? 24 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary">
                  {isAr ? "20 كم عن طريق دمشق حمص الدولي M5" : "20 km from M5"}
                </span>
              </div>
              <p className="text-lg leading-relaxed text-foreground/75">
                {h("oasisText")}
              </p>
              <div className="flex items-center gap-2 text-primary/70">
                <Droplets className="h-5 w-5" />
                <span className="text-sm font-medium">Mia chi — Living Waters</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isAr ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-3xl"
            >
              <div
                className="aspect-[4/3] w-full bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/mheen-oasis-city.webp')",
                  backgroundColor: "var(--color-primary)",
                  backgroundPosition: "center 42%",
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Latest Community Voices ─── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
            {h("pulseTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-foreground/60">
            {h("latestSubtitle")}
          </p>
        </motion.div>

        {latestStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-16 text-center"
          >
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-foreground/20" />
            <p className="text-lg text-foreground/50">{h("noStories")}</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestStories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href="/stories">
                    <div className="group overflow-hidden rounded-2xl border border-primary/8 bg-background shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="aspect-video overflow-hidden bg-primary/5">
                        {story.image_url ? (
                          <img
                            src={story.image_url}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                            <BookOpen className="h-12 w-12 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-primary">
                            {story.author_name || h("anonymous")}
                          </span>
                        </div>
                        <p className="line-clamp-3 text-sm leading-relaxed text-foreground/70">
                          {story.content}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Link
                href="/stories"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 px-6 py-3 text-sm font-medium text-primary transition-all hover:border-primary hover:bg-primary hover:text-white"
              >
                {h("viewAll")}
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </motion.div>
          </>
        )}
      </section>

      {/* ─── 4 Pillars Bento Grid ─── */}
      <section className="bg-stone-100/70 py-20">
        <div className="mx-auto max-w-7xl px-4">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          custom={0}
          className="mb-10 text-center font-qomra text-3xl font-bold text-primary md:text-4xl"
        >
          {h("pillarsTitle")}
        </motion.h2>

        <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.href}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              custom={0.05 + i * 0.08}
              className={pillar.className}
            >
              <Link
                href={pillar.href}
                className="group flex h-full flex-col rounded-2xl p-8 transition-all hover:shadow-xl"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pillar.iconBg} transition-transform group-hover:scale-105`}
                >
                  <pillar.icon
                    className={`h-7 w-7 ${pillar.className.includes("primary") ? "text-white" : "text-primary"}`}
                  />
                </div>
                <h3
                  className={`mt-6 text-xl font-bold ${pillar.className.includes("primary") ? "text-white" : "text-foreground"}`}
                >
                  {pillar.title}
                </h3>
                <p
                  className={`mt-3 flex-1 text-sm leading-relaxed ${pillar.className.includes("primary") ? "text-white/80" : "text-foreground/65"}`}
                >
                  {pillar.desc}
                </p>
                <span
                  className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${pillar.className.includes("primary") ? "text-white/90" : "text-primary"}`}
                >
                  {h("discoverMore")}
                  <ArrowIcon className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
