export const runtime = 'edge';

import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { FadeUp } from "@/components/FadeUp";
import { timeline } from "@/lib/mockData";

type Props = { params: Promise<{ locale: string }> };

export default async function TimelinePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.timeline");
  const isAr = locale === "ar";

  return (
    <div className="p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <FadeUp>
          <h1 className="font-qomra text-3xl font-semibold text-primary md:text-4xl">
            {t("title")}
          </h1>
        </FadeUp>
        <FadeUp delay={0.05}>
          <p className="mt-2 text-foreground/80">{t("subtitle")}</p>
        </FadeUp>
        <div className="mt-12">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20 md:left-1/2 md:-translate-x-px" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <FadeUp key={item.year} delay={0.1 + i * 0.1}>
                  <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                  <div className="flex items-center gap-4 md:w-1/2 md:justify-end">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-primary ring-4 ring-background" />
                    <span className="rounded bg-primary/15 px-3 py-1.5 text-sm font-semibold text-primary">
                      {item.year}
                    </span>
                  </div>
                  <div
                    className={`ml-11 rounded-xl border border-primary/10 bg-background/50 p-5 md:ml-0 md:w-1/2 ${
                      i % 2 === 1 ? "md:order-first md:pr-8 md:text-end" : "md:pl-8"
                    }`}
                  >
                    <p className="text-foreground">{isAr ? item.titleAr : item.titleEn}</p>
                  </div>
                </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
