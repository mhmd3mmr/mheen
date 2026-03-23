export const runtime = 'edge';

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Flame,
  Megaphone,
  HeartHandshake,
  ShieldAlert,
  Tent,
} from "lucide-react";
import { FadeUp } from "@/components/FadeUp";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "@/i18n/navigation";
import { VideoGallery } from "@/components/VideoGallery";
import { BannersArchive } from "@/components/BannersArchive";
import {
  MilitarySection,
  DisplacementSection,
  RecoveryStats,
  HumanCostSection,
} from "@/components/AboutRevolutionSections";
import { MheenInTheLinesOfRevolution } from "@/components/MheenInTheLinesOfRevolution";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "بلدة مهين | ذاكرة الثورة" : "Mheen Town | Revolution Memory";

  return {
    title,
    openGraph: {
      title,
    },
  };
}

const MILITARY_KEYS = [
  "stickyTitle", "stickySub",
  "mil1Title", "mil1Desc", "mil2Title", "mil2Desc", "mil3Title", "mil3Desc",
] as const;

const DISPLACEMENT_KEYS = [
  "darkHeadline", "darkSub", "darkQuote", "darkWarning",
] as const;

const RECOVERY_KEYS = [
  "recTitle", "recSub",
  "rec1Num", "rec1Label", "rec1Desc",
  "rec2Num", "rec2Label", "rec2Desc",
  "rec3Label", "rec3Desc",
  "rec4Num", "rec4Label", "rec4Desc",
] as const;

const HUMAN_COST_KEYS = [
  "costTitle",
  "cost1Label", "cost1Desc", "cost1Source",
  "cost2Label", "cost2Desc", "cost2Source",
] as const;

function pickKeys(
  raw: (k: string) => string,
  keys: readonly string[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = raw(k);
  return out;
}

export default async function RevolutionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.revolution");
  const ms = await getTranslations("pages.mheenStory");

  const militaryT = pickKeys(ms, MILITARY_KEYS);
  const displacementT = pickKeys(ms, DISPLACEMENT_KEYS);
  const recoveryT = pickKeys(ms, RECOVERY_KEYS);
  const humanCostT = pickKeys(ms, HUMAN_COST_KEYS);

  const timeline = [
    {
      title: t("revolutionNode1Title"),
      desc: t("revolutionNode1Desc"),
      icon: Megaphone,
      accent: "bg-amber-100 text-amber-700",
    },
    {
      title: t("revolutionNode2Title"),
      desc: t("revolutionNode2Desc"),
      icon: HeartHandshake,
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      title: t("revolutionNode3Title"),
      desc: t("revolutionNode3Desc"),
      icon: ShieldAlert,
      accent: "bg-rose-100 text-rose-700",
    },
    {
      title: t("revolutionNode4Title"),
      desc: t("revolutionNode4Desc"),
      icon: Tent,
      accent: "bg-sky-100 text-sky-700",
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
        <FadeUp>
          <p className="text-center text-base leading-8 text-foreground/70 md:text-lg">
            {t("revolutionIntro")}
          </p>
        </FadeUp>
      </section>

      {/* Military Geography */}
      <MilitarySection t={militaryT} />

      <MheenInTheLinesOfRevolution />

      {/* Revolution Timeline */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
        <FadeUp>
          <div className="mb-12 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
              {t("revolutionTitle")}
            </h2>
          </div>
        </FadeUp>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute start-6 top-0 h-full border-s border-slate-300/80 md:start-1/2 md:-translate-x-1/2" />

          <div className="space-y-10">
            {timeline.map((item, i) => {
              const showOnRight = i % 2 === 0;
              const Icon = item.icon;
              return (
                <FadeUp key={i} delay={0.1 + i * 0.1}>
                  <article className="relative flex min-h-[168px] items-start gap-5 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8">
                    {/* Mobile icon node */}
                    <div
                      className={`absolute start-3 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full ${item.accent} ring-4 ring-background md:hidden`}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>

                    {/* Mobile layout */}
                    <div className="ms-14 md:hidden">
                      <div className="rounded-2xl border border-slate-200 bg-background p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/70">{item.desc}</p>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden md:contents">
                      {showOnRight ? (
                        <>
                          <div className="hidden md:block" />
                          <div className="relative flex items-start justify-center pt-2">
                            <div className={`z-10 flex h-12 w-12 items-center justify-center rounded-2xl ${item.accent} shadow-sm ring-8 ring-background`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="flex">
                            <div className="ms-auto max-w-md rounded-2xl border border-slate-200 bg-background p-7 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                              <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                              <p className="mt-3 text-base leading-relaxed text-foreground/70">{item.desc}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="me-auto max-w-md rounded-2xl border border-slate-200 bg-background p-7 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                              <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                              <p className="mt-3 text-base leading-relaxed text-foreground/70">{item.desc}</p>
                            </div>
                          </div>
                          <div className="relative flex items-start justify-center pt-2">
                            <div className={`z-10 flex h-12 w-12 items-center justify-center rounded-2xl ${item.accent} shadow-sm ring-8 ring-background`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="hidden md:block" />
                        </>
                      )}
                    </div>
                  </article>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* Displacement */}
      <DisplacementSection t={displacementT} />

      {/* Video Gallery */}
      <VideoGallery />

      {/* Banners Archive */}
      <BannersArchive />

      {/* Human Cost & Justice */}
      <HumanCostSection t={humanCostT} />

      {/* The Cost of Freedom */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-16">
        <FadeUp>
          <article className="overflow-hidden rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white shadow-2xl md:p-10">
            <h3 className="font-qomra text-3xl font-bold md:text-4xl">
              {t("costOfFreedomTitle")}
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
              {t("costOfFreedomDesc")}
            </p>
            <div className="mt-8">
              <Link
                href="/record-of-honor"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
              >
                {t("costOfFreedomButton")}
              </Link>
            </div>
          </article>
        </FadeUp>
      </section>

      {/* Recovery Stats */}
      <RecoveryStats t={recoveryT} />
    </div>
  );
}
