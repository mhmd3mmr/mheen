import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Shield,
  Zap,
  Server,
  Globe,
  Linkedin,
  Facebook,
  Instagram,
  Eye,
  User,
  Code,
} from "lucide-react";
import { FadeUp } from "@/components/FadeUp";
import { CreatorImage } from "@/components/CreatorImage";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutProjectPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.aboutProject");

  const techCards = [
    { icon: Zap, title: t("tech1Title"), desc: t("tech1Desc"), color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Shield, title: t("tech2Title"), desc: t("tech2Desc"), color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Server, title: t("tech3Title"), desc: t("tech3Desc"), color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="min-h-[60vh] pb-24">
      {/* Hero Header */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-primary px-4 pb-24 pt-16 md:-mx-8 md:-mt-8 md:px-8 md:pb-28 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/80 via-primary to-primary" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeUp>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Code className="h-7 w-7 text-accent" />
            </div>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h1 className="font-qomra text-4xl font-bold text-white md:text-5xl">
              {t("title")}
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/60 md:text-lg">
              {t("subtitle")}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Main content area */}
      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-20 px-4 sm:px-6 lg:px-8">

        {/* Vision Section — floats over hero */}
        <section className="-mt-14">
          <FadeUp delay={0.15}>
            <div className="w-full rounded-2xl border border-primary/10 bg-background p-8 shadow-lg md:p-12">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
                  {t("visionTitle")}
                </h2>
              </div>
              <p className="text-lg leading-[1.9] text-foreground/75 md:text-xl">
                {t("visionText")}
              </p>
            </div>
          </FadeUp>
        </section>

        {/* Creator Section */}
        <section>
          <FadeUp delay={0.05}>
            <div className="overflow-hidden rounded-3xl border border-primary/8 bg-background p-8 shadow-md md:p-12">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
                  {t("creatorTitle")}
                </h2>
              </div>

              <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-14">
                {/* Image */}
                <div className="md:col-span-5">
                  <CreatorImage
                    src="/images/mohammad.jpg"
                    alt={t("creatorName")}
                  />
                </div>

                {/* Info */}
                <div className="space-y-5 text-start md:col-span-7">
                  <div>
                    <h3 className="font-qomra text-3xl font-bold text-foreground">
                      {t("creatorName")}
                    </h3>
                    <p className="mt-1 text-base font-medium text-accent">
                      {t("creatorNameEn")}
                    </p>
                  </div>
                  <p className="text-lg font-medium text-primary/80">
                    {t("creatorRole")}
                  </p>
                  <p className="text-lg leading-[1.9] text-foreground/65">
                    {t("creatorBio")}
                  </p>

                  {/* Social Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href="https://mhmd3mmr.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/12 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      <Globe className="h-4 w-4" />
                      {t("website")}
                    </a>
                    <a
                      href="https://www.linkedin.com/in/mhmd3mmr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/12 text-primary/50 transition-all hover:bg-primary hover:text-white"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href="https://www.facebook.com/mhmd3mmr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/12 text-primary/50 transition-all hover:bg-primary hover:text-white"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a
                      href="https://www.instagram.com/mhmd3mmr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/12 text-primary/50 transition-all hover:bg-primary hover:text-white"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </section>

        {/* Tech Stack Section */}
        <section>
          <FadeUp>
            <div className="text-center">
              <h2 className="font-qomra text-2xl font-bold text-primary md:text-3xl">
                {t("techTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-foreground/55">
                {t("techSubtitle")}
              </p>
            </div>
          </FadeUp>

          <div className="mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {techCards.map((card, i) => (
              <FadeUp key={i} delay={0.1 + i * 0.08} className="h-full">
                <div className="group flex h-full flex-col items-start rounded-2xl border border-primary/8 bg-background p-8 text-start shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg} transition-transform group-hover:scale-110`}
                  >
                    <card.icon className={`h-7 w-7 ${card.color}`} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-primary">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-foreground/60">
                    {card.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
