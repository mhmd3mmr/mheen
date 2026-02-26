import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { FadeUp } from "@/components/FadeUp";
import { timeline } from "@/lib/mockData";

type Props = { params: Promise<{ locale: string }> };

export default async function UprisingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.uprising");
  const isAr = locale === "ar";

  return (
    <div className="p-4 md:p-8">
      <div className="container mx-auto max-w-3xl">
        <FadeUp>
          <h1 className="font-qomra text-3xl font-semibold text-primary md:text-4xl">
            {t("title")}
          </h1>
        </FadeUp>
        <FadeUp delay={0.05}>
          <p className="mt-2 text-foreground/80">{t("subtitle")}</p>
        </FadeUp>
        <div className="mt-10 space-y-6">
          {timeline.map((item, i) => (
            <FadeUp key={item.year} delay={0.1 + i * 0.08}>
              <div className="rounded-xl border border-primary/10 bg-background/50 p-6">
              <span className="inline-block rounded bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                {item.year}
              </span>
              <p className="mt-3 text-lg leading-relaxed text-foreground">
                {isAr ? item.titleAr : item.titleEn}
              </p>
            </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </div>
  );
}
