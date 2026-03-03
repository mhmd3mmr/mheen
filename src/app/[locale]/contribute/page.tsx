export const runtime = "edge";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/PageHeader";
import { BookOpen, Shield, UserX, Camera, CheckCircle2 } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export default async function ContributePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.contribute");

  const cards = [
    {
      icon: BookOpen,
      title: t("card_story_title"),
      desc: t("card_story_desc"),
      btn: t("card_story_btn"),
      href: "/submit?tab=story",
    },
    {
      icon: Shield,
      title: t("card_martyr_title"),
      desc: t("card_martyr_desc"),
      btn: t("card_martyr_btn"),
      href: "/submit?tab=honor&type=martyr",
    },
    {
      icon: UserX,
      title: t("card_detainee_title"),
      desc: t("card_detainee_desc"),
      btn: t("card_detainee_btn"),
      href: "/submit?tab=honor&type=detainee",
    },
    {
      icon: Camera,
      title: t("card_photo_title"),
      desc: t("card_photo_desc"),
      btn: t("card_photo_btn"),
      href: "/submit-community-photo",
    },
  ] as const;

  return (
    <div className="min-h-[60vh] bg-background">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8 md:py-16">
        <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
          {t("motivation_title")}
        </h2>
        <p className="mt-5 text-base leading-8 text-foreground/75 md:text-lg">
          {t("motivation_text")}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 md:py-10">
        <h3 className="mb-6 text-center font-qomra text-2xl font-bold text-primary md:text-3xl">
          {t("options_title")}
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="group flex h-full flex-col rounded-2xl border border-primary/10 bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-foreground">{card.title}</h4>
                <p className="mt-2 flex-1 text-sm leading-7 text-foreground/65">{card.desc}</p>
                <Link
                  href={card.href}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  {card.btn}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-6 md:p-8">
          <h3 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
            {t("guide_title")}
          </h3>
          <div className="mt-5 space-y-4">
            {[t("guide_1"), t("guide_2"), t("guide_3")].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <p className="text-sm leading-7 text-foreground/75 md:text-base">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
