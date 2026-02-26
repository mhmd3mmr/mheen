"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  Mountain,
  Route,
  Languages,
  Users,
  Warehouse,
  Building2,
  Swords,
  AlertTriangle,
  BookOpen,
  Handshake,
  School,
  Zap,
  HeartPulse,
  Tractor,
  Scale,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(id);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Fade-in-view wrapper                                               */
/* ------------------------------------------------------------------ */
const fadeVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeVariant}
      initial="hidden"
      animate="visible"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
export type MheenStoryProps = {
  t: Record<string, string>;
  locale: string;
};

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */
export default function MheenStoryClient({ t, locale }: MheenStoryProps) {
  const isAr = locale === "ar";

  /* dark section scroll-driven animation */
  const darkRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: darkProgress } = useScroll({
    target: darkRef,
    offset: ["start end", "start 0.3"],
  });
  const darkBg = useTransform(darkProgress, [0, 1], ["#fafaf9", "#0a0a0a"]);
  const darkText = useTransform(
    darkProgress,
    [0, 1],
    ["#1c1917", "#fafaf9"]
  );

  /* hero parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  const milCards = [
    {
      icon: Warehouse,
      title: t.mil1Title,
      desc: t.mil1Desc,
      accent: "border-red-500/30 bg-red-500/5",
    },
    {
      icon: Building2,
      title: t.mil2Title,
      desc: t.mil2Desc,
      accent: "border-orange-500/30 bg-orange-500/5",
    },
    {
      icon: Swords,
      title: t.mil3Title,
      desc: t.mil3Desc,
      accent: "border-amber-500/30 bg-amber-500/5",
    },
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative flex min-h-[52vh] items-center justify-center overflow-hidden bg-primary md:min-h-[58vh]"
      >
        {/* SVG pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -top-60 start-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 px-6 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-qomra text-[clamp(4rem,12vw,10rem)] font-bold leading-none tracking-tight text-white"
          >
            {t.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-lg text-white/50 md:text-xl"
          >
            {t.heroSub}
          </motion.p>

          {/* scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex flex-col items-center gap-2 text-white/30"
          >
            <span className="text-xs tracking-widest uppercase">
              {isAr ? "مرّر للأسفل" : "Scroll down"}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="h-10 w-[1px] bg-gradient-to-b from-white/40 to-transparent"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== ETYMOLOGY — 3 CARDS ===== */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
                <Languages className="h-5 w-5 text-gray-700" />
              </div>
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {t.etymTitle}
              </h2>
            </div>
          </Reveal>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: "ع",
                title: t.etymArabicTitle,
                desc: t.etymArabicDesc,
                bg: "bg-stone-100",
              },
              {
                icon: "ܐ",
                title: t.etymAramaicTitle,
                desc: t.etymAramaicDesc,
                bg: "bg-blue-50",
              },
              {
                icon: "☽",
                title: t.etymPersianTitle,
                desc: t.etymPersianDesc,
                bg: "bg-yellow-50",
              },
            ].map((card, i) => (
              <Reveal key={i} delay={0.08 + i * 0.1} className="h-full">
                <div
                  className={`flex h-full flex-col items-center rounded-2xl border border-gray-100 ${card.bg} p-8 text-center shadow-sm transition-shadow hover:shadow-md`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-primary shadow-sm">
                    {card.icon}
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/65">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENTO GRID (Geography) ===== */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
            {t.bentoTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Large — Topography */}
          <Reveal delay={0.05} className="md:col-span-2">
            <div className="group relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl bg-primary p-8 text-white">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cpath d='M0 300 Q150 100 300 300 Q450 500 600 300' fill='none' stroke='white' stroke-width='1.5' opacity='0.4'/%3E%3Cpath d='M0 350 Q150 150 300 350 Q450 550 600 350' fill='none' stroke='white' stroke-width='1' opacity='0.25'/%3E%3Cpath d='M0 250 Q150 50 300 250 Q450 450 600 250' fill='none' stroke='white' stroke-width='1' opacity='0.25'/%3E%3C/svg%3E\")",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute end-6 top-6 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                <Mountain className="h-3.5 w-3.5" />
                {t.topoLabel}
              </div>
              <div className="relative z-10">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black tracking-tight md:text-7xl">
                    {t.elevation}
                  </span>
                  <span className="text-sm text-white/60">
                    {t.elevationUnit}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-white/70">
                  <Route className="h-4 w-4 shrink-0" />
                  <span className="text-sm">
                    {t.m5dist} {t.m5label}
                  </span>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
                  {t.topoDesc}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Population */}
          <Reveal delay={0.15}>
            <div className="group flex h-full min-h-[300px] flex-col items-center justify-center rounded-3xl border border-primary/10 bg-background p-8 text-center transition-all hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="mt-5 text-5xl font-black text-primary md:text-6xl">
                <AnimatedCounter target={17000} />
              </p>
              <p className="mt-3 text-sm font-medium text-foreground/70">
                {t.popLabel}
              </p>
              <p className="mt-1 text-xs text-foreground/40">{t.popSub}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== STICKY SCROLL — Military Section ===== */}
      <section className="bg-neutral-50 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 md:grid-cols-5">
          {/* Sticky column */}
          <div className="md:col-span-2">
            <div className="sticky top-32">
              <Reveal>
                <span className="mb-3 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  {t.stickySub}
                </span>
                <h2 className="font-qomra text-3xl font-bold text-foreground md:text-4xl">
                  {t.stickyTitle}
                </h2>
                <div className="mt-6 h-1 w-16 rounded-full bg-red-500/60" />
              </Reveal>
            </div>
          </div>

          {/* Scrolling cards */}
          <div className="flex flex-col gap-8 md:col-span-3">
            {milCards.map((card, i) => (
              <Reveal key={i} delay={0.05 + i * 0.1}>
                <div
                  className={`rounded-3xl border ${card.accent} p-8 transition-all hover:-translate-y-1 hover:shadow-lg`}
                >
                  <card.icon className="h-8 w-8 text-foreground/60" />
                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-foreground/60">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DARK MODE TRANSITION ===== */}
      <motion.section
        ref={darkRef}
        style={{ backgroundColor: darkBg, color: darkText }}
        className="relative min-h-screen overflow-hidden py-32"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-qomra text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              {t.darkHeadline}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 text-xl opacity-50 md:text-2xl">
              {t.darkSub}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <blockquote className="relative mt-20 border-s-4 border-white/20 ps-6 md:mt-28">
              <p className="text-xl leading-relaxed opacity-70 md:text-2xl">
                &ldquo;{t.darkQuote}&rdquo;
              </p>
            </blockquote>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-20 rounded-2xl border border-red-500/30 bg-red-500/10 p-8 backdrop-blur-sm md:mt-28">
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-400" />
                <p className="text-base leading-relaxed md:text-lg">
                  {t.darkWarning}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </motion.section>

      {/* ===== SECTION: TRAVELER'S EYE — SPLIT LAYOUT ===== */}
      <section className="bg-background py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-14 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                <BookOpen className="h-5 w-5 text-amber-700" />
              </div>
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {t.travTitle}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 1812 side */}
            <Reveal delay={0.1}>
              <div className="relative flex h-full flex-col justify-between rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50/50 p-8">
                <span className="inline-block self-start rounded-full bg-amber-200/70 px-3 py-1 text-xs font-bold text-amber-800">
                  {t.travThen}
                </span>
                <blockquote className="mt-6 flex-1">
                  <p className="text-lg font-medium leading-relaxed text-amber-950/80">
                    &ldquo;{t.travQuote}&rdquo;
                  </p>
                </blockquote>
                <p className="mt-6 text-sm font-medium text-amber-700/70">
                  — {t.travAuthor}
                </p>
              </div>
            </Reveal>

            {/* 2010 side */}
            <Reveal delay={0.2}>
              <div className="relative flex h-full flex-col justify-between rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 to-emerald-50/50 p-8">
                <span className="inline-block self-start rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                  {t.travNow}
                </span>
                <p className="mt-6 flex-1 text-lg leading-relaxed text-foreground/75">
                  {t.travModern}
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">
                    <AnimatedCounter target={17000} />
                  </span>
                  <span className="text-sm text-foreground/50">
                    {t.popLabel}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== SECTION: SOCIAL FABRIC — FLOATING CARDS ===== */}
      <section className="bg-neutral-50 py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {t.fabTitle}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mb-14 max-w-2xl text-base leading-relaxed text-foreground/60">
              {t.fabDesc}
            </p>
          </Reveal>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* connecting line (desktop only) */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block" />

            {[
              { name: t.fab1Name, desc: t.fab1Desc, color: "border-primary/20 bg-primary/5", dot: "bg-primary" },
              { name: t.fab2Name, desc: t.fab2Desc, color: "border-blue-200 bg-blue-50", dot: "bg-blue-500" },
              { name: t.fab3Name, desc: t.fab3Desc, color: "border-amber-200 bg-amber-50", dot: "bg-amber-500" },
            ].map((card, i) => (
              <Reveal key={i} delay={0.1 + i * 0.1} className="relative z-10">
                <div
                  className={`flex h-full flex-col items-center rounded-3xl border ${card.color} p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className={`h-4 w-4 rounded-full ${card.dot} ring-4 ring-background shadow-lg`} />
                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {card.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION: MIRAGE OF RECOVERY — STATS ===== */}
      <section className="bg-neutral-950 py-28 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
              {t.recSub}
            </span>
            <h2 className="font-qomra text-3xl font-bold md:text-4xl">
              {t.recTitle}
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: t.rec1Num, label: t.rec1Label, desc: t.rec1Desc, icon: School, accent: "from-red-500/20 to-red-500/5", bar: "bg-red-500", barW: "8%" },
              { num: t.rec2Num, label: t.rec2Label, desc: t.rec2Desc, icon: Zap, accent: "from-amber-500/20 to-amber-500/5", bar: "bg-amber-500", barW: "12%" },
              { num: null, label: t.rec3Label, desc: t.rec3Desc, icon: HeartPulse, accent: "from-rose-500/20 to-rose-500/5", bar: "bg-rose-500", barW: "3%" },
              { num: t.rec4Num, label: t.rec4Label, desc: t.rec4Desc, icon: Tractor, accent: "from-orange-500/20 to-orange-500/5", bar: "bg-orange-500", barW: "5%" },
            ].map((stat, i) => (
              <Reveal key={i} delay={0.05 + i * 0.08}>
                <div className="group flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/15 hover:bg-white/[0.06]">
                  <stat.icon className="h-6 w-6 text-white/40" />
                  {stat.num && (
                    <p className="mt-4 text-5xl font-black tracking-tight">
                      {stat.num}
                    </p>
                  )}
                  <p className={`${stat.num ? "mt-2" : "mt-4"} text-sm font-bold text-white/80`}>
                    {stat.label}
                  </p>
                  {/* progress bar */}
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={`h-full rounded-full ${stat.bar}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.barW }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-3 flex-1 text-xs leading-relaxed text-white/40">
                    {stat.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION: HUMAN COST & JUSTICE — STATEMENT BLOCK ===== */}
      <section className="bg-background py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-14 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {t.costTitle}
              </h2>
            </div>
          </Reveal>

          <div className="space-y-8">
            {/* Document 1 — Human Cost */}
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-background p-8 shadow-sm">
                <div className="absolute end-0 top-0 h-24 w-24 bg-gradient-to-bl from-red-500/5 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {t.cost1Label}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-foreground/65">
                      {t.cost1Desc}
                    </p>
                    <p className="mt-4 text-xs font-medium text-foreground/35">
                      — {t.cost1Source}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Document 2 — Justice */}
            <Reveal delay={0.2}>
              <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-background p-8 shadow-sm">
                <div className="absolute end-0 top-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/5 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {t.cost2Label}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-foreground/65">
                      {t.cost2Desc}
                    </p>
                    <p className="mt-4 text-xs font-medium text-foreground/35">
                      — {t.cost2Source}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
