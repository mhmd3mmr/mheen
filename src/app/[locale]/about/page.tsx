import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  MapPin,
  Users,
  Mountain,
  Route,
  Languages,
  Flame,
} from "lucide-react";
import { FadeUp } from "@/components/FadeUp";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");

  const stats = [
    { icon: MapPin, label: t("statsLocation"), value: t("statsLocationVal"), color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Users, label: t("statsPopulation"), value: t("statsPopulationVal"), color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Mountain, label: t("statsElevation"), value: t("statsElevationVal"), color: "text-amber-600", bg: "bg-amber-50" },
    { icon: Route, label: t("statsStrategy"), value: t("statsStrategyVal"), color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const etymology = [
    { title: t("etymArabicTitle"), desc: t("etymArabicDesc"), icon: "ع", color: "border-primary/20 bg-primary/5" },
    { title: t("etymAramaicTitle"), desc: t("etymAramaicDesc"), icon: "ܐ", color: "border-blue-200 bg-blue-50" },
    { title: t("etymPersianTitle"), desc: t("etymPersianDesc"), icon: "☽", color: "border-amber-200 bg-amber-50" },
  ];

  const timeline = [
    { year: t("tl1Year"), title: t("tl1Title"), desc: t("tl1Desc"), accent: "bg-red-500" },
    { year: t("tl2Year"), title: t("tl2Title"), desc: t("tl2Desc"), accent: "bg-orange-500" },
    { year: t("tl3Year"), title: t("tl3Title"), desc: t("tl3Desc"), accent: "bg-amber-500" },
    { year: t("tl4Year"), title: t("tl4Title"), desc: t("tl4Desc"), accent: "bg-emerald-500" },
    { year: t("tl5Year"), title: t("tl5Title"), desc: t("tl5Desc"), accent: "bg-blue-500" },
  ];

  return (
    <div className="min-h-[60vh] pb-24">
      {/* Hero */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-primary px-4 pb-28 pt-16 md:-mx-8 md:-mt-8 md:px-8 md:pb-32 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/80 via-primary to-primary" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeUp>
            <h1 className="font-qomra text-5xl font-bold text-white md:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60 md:text-xl">
              {t("subtitle")}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="relative z-10 mx-auto -mt-14 max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <FadeUp key={i} delay={0.05 + i * 0.08} className="h-full">
              <div className="group flex h-full flex-col rounded-2xl border border-primary/10 bg-background p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg} transition-transform group-hover:scale-110`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-primary">
                  {s.label}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/65">
                  {s.value}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Etymology */}
      <section className="mx-auto mt-20 max-w-5xl px-4 sm:px-6">
        <FadeUp>
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
              {t("etymologyTitle")}
            </h2>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {etymology.map((e, i) => (
            <FadeUp key={i} delay={0.1 + i * 0.08} className="h-full">
              <div className={`flex h-full flex-col rounded-2xl border ${e.color} p-7 transition-all hover:-translate-y-1 hover:shadow-lg`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-primary shadow-sm">
                  {e.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-foreground">
                  {e.title}
                </h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-foreground/65">
                  {e.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto mt-24 max-w-5xl px-4 sm:px-6">
        <FadeUp>
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
              {t("timelineTitle")}
            </h2>
          </div>
        </FadeUp>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute start-[23px] top-0 h-full w-0.5 bg-primary/10 md:start-1/2 md:-translate-x-1/2" />

          <div className="space-y-10">
            {timeline.map((item, i) => {
              const isEven = i % 2 === 0;
              return (
                <FadeUp key={i} delay={0.1 + i * 0.1}>
                  <div className="relative flex gap-6 md:gap-0">
                    {/* Dot */}
                    <div className="absolute start-[15px] top-1 z-10 flex h-4 w-4 items-center justify-center md:start-1/2 md:-translate-x-1/2">
                      <div className={`h-4 w-4 rounded-full ${item.accent} ring-4 ring-background`} />
                    </div>

                    {/* Mobile layout */}
                    <div className="ms-14 md:hidden">
                      <div className="rounded-2xl border border-primary/8 bg-background p-6 shadow-md">
                        <span className={`inline-block rounded-lg px-3 py-1 text-xs font-bold text-white ${item.accent}`}>
                          {item.year}
                        </span>
                        <h3 className="mt-3 text-lg font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden w-full md:grid md:grid-cols-2 md:gap-12">
                      {isEven ? (
                        <>
                          <div className="flex justify-end">
                            <div className="max-w-md rounded-2xl border border-primary/8 bg-background p-6 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                              <span className={`inline-block rounded-lg px-3 py-1 text-xs font-bold text-white ${item.accent}`}>
                                {item.year}
                              </span>
                              <h3 className="mt-3 text-lg font-bold text-foreground">
                                {item.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <div />
                        </>
                      ) : (
                        <>
                          <div />
                          <div>
                            <div className="max-w-md rounded-2xl border border-primary/8 bg-background p-6 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                              <span className={`inline-block rounded-lg px-3 py-1 text-xs font-bold text-white ${item.accent}`}>
                                {item.year}
                              </span>
                              <h3 className="mt-3 text-lg font-bold text-foreground">
                                {item.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
