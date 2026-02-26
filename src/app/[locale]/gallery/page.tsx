import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Camera } from "lucide-react";
import { FadeUp } from "@/components/FadeUp";

const PLACEHOLDER_COLORS = [
  "bg-primary/20",
  "bg-secondary/20",
  "bg-accent/20",
  "bg-success/20",
  "bg-primary/15",
  "bg-secondary/15",
  "bg-accent/15",
  "bg-success/15",
  "bg-primary/10",
  "bg-secondary/10",
];

type Props = { params: Promise<{ locale: string }> };

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.gallery");

  return (
    <div className="p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <FadeUp>
          <h1 className="font-qomra text-3xl font-semibold text-primary md:text-4xl">
            {t("title")}
          </h1>
        </FadeUp>
        <FadeUp delay={0.05}>
          <p className="mt-2 text-foreground/80">{t("subtitle")}</p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="mt-10 columns-2 gap-4 sm:columns-3 md:columns-4">
          {PLACEHOLDER_COLORS.map((color, i) => (
            <div
              key={i}
              className={`mb-4 break-inside-avoid rounded-lg ${color} flex aspect-[4/3] items-center justify-center`}
            >
              <Camera className="h-12 w-12 text-foreground/30 sm:h-16 sm:w-16" />
            </div>
          ))}
        </div>
        </FadeUp>
      </div>
    </div>
  );
}
