export const runtime = 'edge';

import { getTranslations, setRequestLocale } from "next-intl/server";
import MheenStoryClient from "@/components/MheenStoryClient";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutMheenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await getTranslations("pages.mheenStory");

  const keys = [
    "heroTitle",
    "heroSub",
    "bentoTitle",
    "elevation",
    "elevationUnit",
    "m5dist",
    "m5label",
    "topoLabel",
    "topoDesc",
    "etymTitle",
    "etymArabic",
    "etymAramaic",
    "etymPersian",
    "etymArabicTitle",
    "etymArabicDesc",
    "etymAramaicTitle",
    "etymAramaicDesc",
    "etymPersianTitle",
    "etymPersianDesc",
    "popNumber",
    "popLabel",
    "popSub",
    "stickyTitle",
    "stickySub",
    "mil1Title",
    "mil1Desc",
    "mil2Title",
    "mil2Desc",
    "mil3Title",
    "mil3Desc",
    "darkHeadline",
    "darkSub",
    "darkQuote",
    "darkWarning",
    "travTitle",
    "travQuote",
    "travAuthor",
    "travThen",
    "travNow",
    "travModern",
    "fabTitle",
    "fabDesc",
    "fab1Name",
    "fab1Desc",
    "fab2Name",
    "fab2Desc",
    "fab3Name",
    "fab3Desc",
    "recTitle",
    "recSub",
    "rec1Num",
    "rec1Label",
    "rec1Desc",
    "rec2Num",
    "rec2Label",
    "rec2Desc",
    "rec3Label",
    "rec3Desc",
    "rec4Num",
    "rec4Label",
    "rec4Desc",
    "costTitle",
    "cost1Label",
    "cost1Desc",
    "cost1Source",
    "cost2Label",
    "cost2Desc",
    "cost2Source",
  ] as const;

  const t: Record<string, string> = {};
  for (const k of keys) t[k] = raw(k);

  return <MheenStoryClient t={t} locale={locale} />;
}
