"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

const HERO_BUTTONS = [
  { key: "about" as const, href: "/about-mheen", variant: "primary" as const },
  { key: "martyrs" as const, href: "/martyrs", variant: "primary" as const },
  { key: "stories" as const, href: "/stories", variant: "outline" as const },
  { key: "submit" as const, href: "/submit", variant: "outline" as const },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Hero section: title, intro, and routing buttons with solemn fade-in / slide-up.
 */
export function Hero() {
  const t = useTranslations("Hero");
  const tButtons = useTranslations("HeroButtons");

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h1
          className="font-qomra text-4xl font-semibold leading-tight text-primary sm:text-5xl md:text-6xl"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
        >
          {t("title")}
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-foreground/80 sm:mt-8 sm:text-xl"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.25 }}
        >
          {t("intro")}
        </motion.p>
        <motion.div
          className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.4 }}
        >
          {HERO_BUTTONS.map(({ key, href, variant }) => (
            <Link
              key={key}
              href={href}
              className={
                variant === "primary"
                  ? "rounded-lg bg-primary px-5 py-3.5 text-center font-medium text-background shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  : "rounded-lg border-2 border-secondary bg-transparent px-5 py-3.5 text-center font-medium text-secondary transition-all hover:bg-secondary/10 hover:border-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background"
              }
            >
              {tButtons(key)}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
