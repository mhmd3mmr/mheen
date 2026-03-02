"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  Warehouse,
  Building2,
  Swords,
  AlertTriangle,
  School,
  Zap,
  HeartPulse,
  Tractor,
  Scale,
  Sparkles,
} from "lucide-react";

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
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type T = Record<string, string>;

/* ================================================================== */
/*  1. Military Section (عسكرة الجغرافيا / الثقب الأسود العسكري)       */
/* ================================================================== */
export function MilitarySection({ t }: { t: T }) {
  const milCards = [
    { icon: Warehouse, title: t.mil1Title, desc: t.mil1Desc, accent: "border-red-500/30 bg-red-500/5" },
    { icon: Building2, title: t.mil2Title, desc: t.mil2Desc, accent: "border-orange-500/30 bg-orange-500/5" },
    { icon: Swords, title: t.mil3Title, desc: t.mil3Desc, accent: "border-amber-500/30 bg-amber-500/5" },
  ];

  return (
    <section className="bg-neutral-50 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 md:grid-cols-5">
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

        <div className="flex flex-col gap-8 md:col-span-3">
          {milCards.map((card, i) => (
            <Reveal key={i} delay={0.05 + i * 0.1}>
              <div
                className={`rounded-3xl border ${card.accent} p-8 transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <card.icon className="h-8 w-8 text-foreground/60" />
                <h3 className="mt-5 text-xl font-bold text-foreground">{card.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-foreground/60">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  2. Dark Displacement Section (من الواحة إلى الرمال)               */
/* ================================================================== */
export function DisplacementSection({ t }: { t: T }) {
  const darkRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: darkRef,
    offset: ["start end", "start 0.3"],
  });
  const darkBg = useTransform(scrollYProgress, [0, 1], ["#fafaf9", "#0a0a0a"]);
  const darkText = useTransform(scrollYProgress, [0, 1], ["#1c1917", "#fafaf9"]);

  return (
    <motion.section
      ref={darkRef}
      style={{ backgroundColor: darkBg, color: darkText }}
      className="relative min-h-[70vh] overflow-hidden py-24 md:min-h-screen md:py-32"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-qomra text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            {t.darkHeadline}
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-4 text-xl opacity-50 md:text-2xl">{t.darkSub}</p>
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
              <p className="text-base leading-relaxed md:text-lg">{t.darkWarning}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </motion.section>
  );
}

/* ================================================================== */
/*  3. Recovery Stats (سراب التعافي)                                  */
/* ================================================================== */
export function RecoveryStats({ t }: { t: T }) {
  const stats = [
    { num: t.rec1Num, label: t.rec1Label, desc: t.rec1Desc, icon: School, accent: "from-red-500/20 to-red-500/5", bar: "bg-red-500", barW: "8%" },
    { num: t.rec2Num, label: t.rec2Label, desc: t.rec2Desc, icon: Zap, accent: "from-amber-500/20 to-amber-500/5", bar: "bg-amber-500", barW: "12%" },
    { num: null, label: t.rec3Label, desc: t.rec3Desc, icon: HeartPulse, accent: "from-rose-500/20 to-rose-500/5", bar: "bg-rose-500", barW: "3%" },
    { num: t.rec4Num, label: t.rec4Label, desc: t.rec4Desc, icon: Tractor, accent: "from-orange-500/20 to-orange-500/5", bar: "bg-orange-500", barW: "5%" },
  ];

  return (
    <section className="bg-neutral-950 py-16 text-white md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
            {t.recSub}
          </span>
          <h2 className="font-qomra text-3xl font-bold md:text-4xl">{t.recTitle}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={0.05 + i * 0.08}>
              <div className="group flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/15 hover:bg-white/[0.06]">
                <stat.icon className="h-6 w-6 text-white/40" />
                {stat.num && (
                  <p className="mt-4 text-5xl font-black tracking-tight">{stat.num}</p>
                )}
                <p className={`${stat.num ? "mt-2" : "mt-4"} text-sm font-bold text-white/80`}>
                  {stat.label}
                </p>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${stat.bar}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: stat.barW }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-3 flex-1 text-xs leading-relaxed text-white/40">{stat.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  4. Human Cost & Justice (الثمن الإنساني ومسار العدالة)             */
/* ================================================================== */
export function HumanCostSection({ t }: { t: T }) {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10 flex items-center gap-3 md:mb-14">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
              {t.costTitle}
            </h2>
          </div>
        </Reveal>

        <div className="space-y-8">
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-background p-8 shadow-sm">
              <div className="absolute end-0 top-0 h-24 w-24 bg-gradient-to-bl from-red-500/5 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{t.cost1Label}</h3>
                  <p className="mt-3 text-base leading-relaxed text-foreground/65">{t.cost1Desc}</p>
                  <p className="mt-4 text-xs font-medium text-foreground/35">— {t.cost1Source}</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-background p-8 shadow-sm">
              <div className="absolute end-0 top-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/5 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{t.cost2Label}</h3>
                  <p className="mt-3 text-base leading-relaxed text-foreground/65">{t.cost2Desc}</p>
                  <p className="mt-4 text-xs font-medium text-foreground/35">— {t.cost2Source}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
