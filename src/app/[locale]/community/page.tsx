"use client";

export const runtime = 'edge';

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  Leaf,
  Wheat,
  HandHeart,
  Store,
  BriefcaseBusiness,
  TrainFront,
  Images,
  Coffee,
  Languages,
  Mountain,
  Route,
  Users,
  BookOpen,
  Handshake,
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
  const ref = useRef<HTMLSpanElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number | null = null;
    let start: number | null = null;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = timestamp - start;
      const ratio = Math.min(progress / duration, 1);
      const value = Math.floor(ratio * target);
      setCount(value);
      if (ratio < 1) {
        frame = requestAnimationFrame(step);
      }
    }

    frame = requestAnimationFrame(step);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CommunityPage() {
  const t = useTranslations("pages.community");
  const tStory = useTranslations("pages.mheenStory");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [isHawarinModalOpen, setIsHawarinModalOpen] = useState(false);
  const [isSadadModalOpen, setIsSadadModalOpen] = useState(false);
  const [isQaryataynModalOpen, setIsQaryataynModalOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<
    { caption: string; image: string; category?: string | null }[]
  >([]);

  const mosaicI18n = isAr
    ? {
        closeLabel: "إغلاق النافذة",
        qaryataynCardTitle: "القريتين",
        qaryataynCardDesc: "بوابة الصحراء وتوأم البادية في الجوار والمصير.",
        sadad: {
          title: 'صدد ومهين: حكاية جوار وعلم و"خبز وملح"',
          p1: "تُشكل العلاقة بين بلدتي صدد ومهين نموذجاً تاريخياً فريداً للتعايش السلمي في البادية السورية. فرغم التنوع الديني؛ حيث تُعتبر صدد بلدة مسيحية سريانية عريقة بينما مهين مجتمع مسلم، إلا أن الجوار الجغرافي نسج بينهما روابط اجتماعية واقتصادية لا تُنفصم.",
          p2: 'تجلى أبهى صور هذا الجوار في قطاع التعليم؛ ففي منتصف القرن العشرين، توافد العشرات من المعلمين والأساتذة من أبناء صدد للتدريس في مدارس مهين. لقد كانوا بمثابة "رُسل معرفة" أسهموا في محو الأمية وتأسيس الأجيال الأولى من أطباء ومهندسي مهين، وحظوا باحترام وتوقير مطلق من الأهالي.',
          p3: "لم تقتصر هذه الأخوّة على أسوار المدارس، بل امتدت لتشمل التبادل التجاري اليومي للمحاصيل والمواشي، والمشاركة الصادقة في الأفراح والأتراح، لترسم لوحة أصيلة من العيش المشترك الذي لا يزال حياً في ذاكرة الأجيال.",
        },
        hawarin: {
          title: "حوارين ومهين: توأمة البادية والتاريخ العريق",
          p1: "على تخوم البادية السورية، لا يُذكر اسم «مهين» تاريخياً إلا ويقترن باسم جارتها وتوأمها «حوارين». لا تفصل بين البلدتين سوى مسافة قصيرة، لكن ما يجمعهما هو نسيج اجتماعي وثقافي ضارب في جذور التاريخ.",
          p2: "بينما تميزت حوارين بإرثها الآرامي والأموي العريق، حيث كانت تضم حصوناً وقصوراً تاريخية، كانت مهين بمثابة العمق الزراعي والعشائري. وقد تقاسمت البلدتان عبر مئات السنين مصادر المياه، والمراعي، ونمط الحياة الأصيل.",
          p3: "لقد وثّق الرحالة والمؤرخون هذا التجاور منذ القدم؛ ففي عام 1812م كُتب عنهما: «مررنا ببلدتين صغيرتين متجاورتين هما مهين وحوارين، بينهما ماء يكفيهما.. لباس أهلهما لباس أهل البادية ولهجتهم لهجة البادية». واليوم، لا تزال هذه التوأمة حية، حيث يتشارك أبناء البلدتين العادات، الأصالة، وكرم الضيافة، ليمثلا معاً قلباً واحداً ينبض في البادية.",
        },
        qaryatayn: {
          title: "القريتين ومهين: بوابة البادية ووحدة المصير",
          p1: "تشكل «القريتين» امتداداً طبيعياً وعمقاً جغرافياً لبلدة مهين باتجاه الشرق. وإذا كانت مهين لؤلؤة البادية، فإن القريتين كانت تاريخياً «بوابة الصحراء» والمحطة الأهم لقوافل التجارة المتجهة نحو تدمر.",
          p2: "تقاسمت البلدتان عبر الزمن قساوة البادية وخيراتها، فكان التبادل التجاري والزراعي والرعوي شريان حياة يربط بينهما. كما عكست القريتين، بتركيبتها السكانية الأصيلة التي جمعت بين المسلمين والمسيحيين، امتداداً لروح التعايش والمحبة التي ميزت جيرانها في مهين وصدد.",
          p3: "في التاريخ الحديث، ارتبط مصير البلدتين ارتباطاً وثيقاً؛ فقد واجهتا معاً تحديات الحرب، وقسوة التهجير، وتقاسم أهلهما آلام النزوح وأمل العودة وإعادة الإعمار. لتظل القريتين ومهين اليوم دليلاً حياً على صمود إنسان البادية السورية وتمسكه بأرضه مهما اشتدت الظروف.",
        },
      }
    : {
        closeLabel: "Close dialog",
        qaryataynCardTitle: "Al-Qaryatayn",
        qaryataynCardDesc:
          "The gateway to the desert and the twin of the Badia in neighborhood and destiny.",
        sadad: {
          title: 'Sadad & Mheen: A Tale of Neighborliness, Education, and "Bread and Salt"',
          p1: "The relationship between the towns of Sadad and Mheen forms a unique historical model of peaceful coexistence in the Syrian Badia. Despite religious diversity—Sadad being an ancient Syriac Christian town while Mheen is a Muslim community—geographic proximity has woven unbreakable social and economic ties between them.",
          p2: `The most beautiful aspect of this neighborliness manifested in education. In the mid-20th century, dozens of teachers from Sadad came to teach in Mheen's schools. They acted as "messengers of knowledge," contributing to the eradication of illiteracy and establishing the first generations of Mheen's doctors and engineers, earning absolute respect and reverence from the locals.`,
          p3: "This brotherhood extended beyond school walls to include the daily trade of crops and livestock, and sincere participation in joys and sorrows, painting an authentic picture of coexistence that remains alive in the memory of generations.",
        },
        hawarin: {
          title: "Hawarin & Mheen: Twinning of the Badia and Ancient History",
          p1: `On the outskirts of the Syrian Badia, the name "Mheen" is historically inextricably linked with its neighbor and twin, "Hawarin." Only a short distance separates the two towns, but what unites them is a social and cultural fabric deeply rooted in history.`,
          p2: "While Hawarin was distinguished by its ancient Aramean and Umayyad heritage, featuring historical forts and palaces, Mheen served as the agricultural and tribal depth. For hundreds of years, the two towns shared water sources, pastures, and an authentic way of life.",
          p3: `Travelers and historians have documented this juxtaposition since ancient times. In 1812, it was written about them: "We passed by two small adjacent towns, Mheen and Hawarin, with enough water between them... the dress of their people is the dress of the Badia, and their dialect is the dialect of the Badia." Today, this twinning remains alive, as the people of both towns share customs, authenticity, and hospitality, representing together one heart beating in the Badia.`,
        },
        qaryatayn: {
          title: "Al-Qaryatayn & Mheen: The Gateway to the Badia and Unity of Destiny",
          p1: `"Al-Qaryatayn" forms a natural extension and geographic depth to the town of Mheen towards the east. If Mheen is the pearl of the Badia, Al-Qaryatayn has historically been the "Gateway to the Desert" and the most important station for trade caravans heading towards Palmyra.`,
          p2: "Over time, the two towns shared the harshness and bounties of the Badia, with agricultural, pastoral, and commercial exchange acting as a lifeline connecting them. Al-Qaryatayn, with its authentic demographic fabric bringing Muslims and Christians together, also reflected the spirit of coexistence and love that characterized its neighbors in Mheen and Sadad.",
          p3: "In modern history, the destiny of the two towns has been closely intertwined. They faced the challenges of war and the harshness of displacement together, and their people shared the pains of exile and the hope for return and reconstruction. Al-Qaryatayn and Mheen remain today a living testament to the resilience of the people of the Syrian Badia and their devotion to their land regardless of the circumstances.",
        },
      };

  const harvestBlocks = [
    {
      title: t("harvest1Title"),
      text: t("harvest1Text"),
      image: "/images/community-olive-grove.png",
      icon: Leaf,
    },
    {
      title: t("harvest2Title"),
      text: t("harvest2Text"),
      image: "/images/community-water-path.png",
      icon: Wheat,
    },
  ];

  const dailyCards = [
    {
      icon: HandHeart,
      title: t("daily1Title"),
      body: t("daily1Body"),
    },
    {
      icon: Store,
      title: t("daily2Title"),
      body: t("daily2Body"),
    },
    {
      icon: BriefcaseBusiness,
      title: t("daily3Title"),
      body: t("daily3Body"),
    },
  ];

  useEffect(() => {
    let mounted = true;

    fetch("/api/community-photos")
      .then((res) => res.json())
      .then((data: {
        photos?: Array<{
          id: string;
          title: string;
          title_ar?: string | null;
          title_en?: string | null;
          category?: string | null;
          image_url: string;
        }>;
      }) => {
        if (!mounted) return;
        const rows = data.photos ?? [];
        if (rows.length > 0) {
          setGalleryItems(
            rows.map((r) => ({
              caption:
                locale === "ar"
                  ? r.title_ar || r.title_en || r.title
                  : r.title_en || r.title_ar || r.title,
              image: r.image_url,
              category: r.category ?? null,
            }))
          );
          return;
        }
        setGalleryItems([
          {
            caption: t("galleryCap1"),
            image:
              "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap2"),
            image:
              "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap3"),
            image:
              "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap4"),
            image:
              "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80&sat=-50",
          },
          {
            caption: t("galleryCap5"),
            image:
              "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80&sat=-30",
          },
          {
            caption: t("galleryCap6"),
            image:
              "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80&sat=-35",
          },
          {
            caption: t("galleryCap7"),
            image:
              "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
          {
            caption: t("galleryCap8"),
            image:
              "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=900&q=80&sat=-40",
          },
        ]);
      })
      .catch(() => {
        if (!mounted) return;
        setGalleryItems([]);
      });
    return () => {
      mounted = false;
    };
  }, [t, locale]);

  useEffect(() => {
    if (!isSadadModalOpen && !isHawarinModalOpen && !isQaryataynModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSadadModalOpen(false);
        setIsHawarinModalOpen(false);
        setIsQaryataynModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSadadModalOpen, isHawarinModalOpen, isQaryataynModalOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 text-foreground">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        backgroundImage="/images/mheen-oasis-city.webp"
      />

      {/* About Mheen intro narrative */}
      <section className="relative bg-stone-50 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <article className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-b from-white to-stone-50 p-7 shadow-sm md:p-10">
              <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                {t("introTitle")}
              </div>

              <div className="space-y-6 text-base leading-8 text-foreground/80 md:text-lg">
                <p>{t("introP1")}</p>
                <p>{t("introP2")}</p>
                <p>{t("introP3")}</p>
                <p>{t("introP4")}</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* Historical roots & name origin (from About Mheen) */}
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
                <Languages className="h-5 w-5 text-gray-700" />
              </div>
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {tStory("etymTitle")}
              </h2>
            </div>
          </Reveal>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: "ع",
                title: tStory("etymArabicTitle"),
                desc: tStory("etymArabicDesc"),
                bg: "bg-stone-100",
              },
              {
                icon: "ܐ",
                title: tStory("etymAramaicTitle"),
                desc: tStory("etymAramaicDesc"),
                bg: "bg-blue-50",
              },
              {
                icon: "☽",
                title: tStory("etymPersianTitle"),
                desc: tStory("etymPersianDesc"),
                bg: "bg-yellow-50",
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={0.08 + i * 0.1} className="h-full">
                <div
                  className={`flex h-full flex-col items-center rounded-2xl border border-gray-100 ${card.bg} p-8 text-center shadow-sm transition-shadow hover:shadow-md`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-primary shadow-sm">
                    {card.icon}
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/65">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Geography & roots bento section (from About Mheen) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
            {tStory("bentoTitle")}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Reveal delay={0.05} className="md:col-span-2">
            <div className="group relative flex h-full min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl bg-primary p-8 text-white">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cpath d='M0 300 Q150 100 300 300 Q450 500 600 300' fill='none' stroke='white' stroke-width='1.5' opacity='0.4'/%3E%3Cpath d='M0 350 Q150 150 300 350 Q450 550 600 350' fill='none' stroke='white' stroke-width='1' opacity='0.25'/%3E%3Cpath d='M0 250 Q150 50 300 250 Q450 450 600 250' fill='none' stroke='white' stroke-width='1' opacity='0.25'/%3E%3C/svg%3E\")",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute end-6 top-6 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                <Mountain className="h-3.5 w-3.5" />
                {tStory("topoLabel")}
              </div>
              <div className="relative z-10">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black tracking-tight md:text-7xl">
                    {tStory("elevation")}
                  </span>
                  <span className="text-sm text-white/60">
                    {tStory("elevationUnit")}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-white/70">
                  <Route className="h-4 w-4 shrink-0" />
                  <span className="text-sm">
                    {tStory("m5dist")} {tStory("m5label")}
                  </span>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                  {tStory("topoDesc")}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="group flex h-full min-h-[300px] flex-col items-center justify-center rounded-3xl border border-primary/10 bg-background p-8 text-center transition-all hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="mt-5 text-5xl font-black text-primary md:text-6xl">
                <AnimatedCounter target={17000} />
              </p>
              <p className="mt-3 text-sm font-medium text-foreground/70">
                {tStory("popLabel")}
              </p>
              <p className="mt-1 text-xs text-foreground/40">{tStory("popSub")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Train Station Callout */}
      <section className="relative mx-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1800&q=80')",
            filter: "grayscale(0.35) sepia(0.3)",
          }}
        />
        <div className="absolute inset-0 bg-stone-900/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <Reveal>
            <div className="max-w-3xl text-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-100/10 px-4 py-1.5 text-sm text-amber-100">
                <TrainFront className="h-4 w-4" />
                {t("trainTag")}
              </span>
              <h2 className="mt-5 font-qomra text-4xl font-bold text-amber-50">
                {t("trainTitle")}
              </h2>
              <p className="mt-4 text-lg leading-8 text-stone-100/90">
                {t("trainText")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* People, Customs & Traditions */}
      <section className="w-full bg-[#fdfbf7] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start text-start"
          >
            <div className="inline-flex rounded-full bg-amber-100 p-3 text-amber-700">
              <Coffee className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-qomra text-3xl font-bold text-primary md:text-4xl">
              {t("peopleTitle")}
            </h2>
            <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-gray-700 md:text-xl">
              {t("peopleText")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Harvest & Land – unified editorial layout */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <div className="mb-8 flex items-center gap-3 text-start">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <Leaf className="h-5 w-5" />
            </div>
            <h2 className="font-qomra text-3xl font-bold text-primary">
              {t("harvestSectionTitle")}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <article className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm backdrop-blur md:p-8 lg:p-12">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="ms-2 space-y-10 border-s-2 border-emerald-100 ps-6">
                  <div className="relative">
                    <div className="absolute -start-3 top-2 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                      <Leaf className="h-4 w-4" />
                      {t("harvestTag")}
                    </div>
                    <h3 className="font-qomra text-2xl font-semibold text-stone-900">
                      {harvestBlocks[0]?.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-stone-800">
                      {harvestBlocks[0]?.text}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -start-3 top-2 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800">
                      <Wheat className="h-4 w-4" />
                      {t("harvestTag")}
                    </div>
                    <h3 className="font-qomra text-2xl font-semibold text-stone-900">
                      {harvestBlocks[1]?.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-stone-800">
                      {harvestBlocks[1]?.text}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative h-full min-h-[260px]">
                  <div className="relative w-full max-w-md lg:ms-auto">
                    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-900/5 shadow-lg">
                      <img
                        src={harvestBlocks[0]?.image}
                        alt={harvestBlocks[0]?.title}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {harvestBlocks[1] && (
                    <div className="absolute -bottom-8 -end-4 w-3/5 max-w-xs">
                      <div className="overflow-hidden rounded-2xl border-8 border-emerald-50 bg-emerald-900/5 shadow-xl">
                        <img
                          src={harvestBlocks[1].image}
                          alt={harvestBlocks[1].title}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </Reveal>
      </section>

      {/* Daily Life & Diaspora */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="text-start font-qomra text-3xl font-bold text-primary">
            {t("dailyTitle")}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {dailyCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 0.08}>
                <article className="h-full rounded-2xl border border-stone-200 bg-stone-50 p-6 text-start shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-qomra text-2xl font-semibold text-stone-800">
                    {card.title}
                  </h3>
                  <p className="mt-3 leading-8 text-stone-700">{card.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Traveler's eye — demographic shift (from About Mheen) */}
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-14 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                <BookOpen className="h-5 w-5 text-amber-700" />
              </div>
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {tStory("travTitle")}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal delay={0.1}>
              <div className="relative flex h-full flex-col justify-between rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50/50 p-8">
                <span className="inline-block self-start rounded-full bg-amber-200/70 px-3 py-1 text-xs font-bold text-amber-800">
                  {tStory("travThen")}
                </span>
                <blockquote className="mt-6 flex-1">
                  <p className="text-lg font-medium leading-relaxed text-amber-950/80">
                    &ldquo;{tStory("travQuote")}&rdquo;
                  </p>
                </blockquote>
                <p className="mt-6 text-sm font-medium text-amber-700/70">
                  — {tStory("travAuthor")}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="relative flex h-full flex-col justify-between rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 to-emerald-50/50 p-8">
                <span className="inline-block self-start rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                  {tStory("travNow")}
                </span>
                <p className="mt-6 flex-1 text-lg leading-relaxed text-foreground/75">
                  {tStory("travModern")}
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">
                    <AnimatedCounter target={17000} />
                  </span>
                  <span className="text-sm text-foreground/50">
                    {tStory("popLabel")}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Social fabric — coexistence mosaic (from About Mheen) */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {tStory("fabTitle")}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mb-14 max-w-2xl text-base leading-relaxed text-foreground/60">
              {tStory("fabDesc")}
            </p>
          </Reveal>

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block" />

            {[
              { key: "mheen", name: tStory("fab1Name"), desc: tStory("fab1Desc"), color: "border-primary/20 bg-primary/5", dot: "bg-primary" },
              { key: "sadad", name: tStory("fab2Name"), desc: tStory("fab2Desc"), color: "border-blue-200 bg-blue-50", dot: "bg-blue-500" },
              { key: "hawarin", name: tStory("fab3Name"), desc: tStory("fab3Desc"), color: "border-amber-200 bg-amber-50", dot: "bg-amber-500" },
              { key: "qaryatayn", name: mosaicI18n.qaryataynCardTitle, desc: mosaicI18n.qaryataynCardDesc, color: "border-purple-200 bg-purple-50", dot: "bg-purple-500" },
            ].map((card, i) => (
              <Reveal key={card.name} delay={0.1 + i * 0.1} className="relative z-10">
                {card.key === "sadad" ? (
                  <button
                    type="button"
                    onClick={() => setIsSadadModalOpen(true)}
                    className={`flex h-full w-full flex-col items-center rounded-3xl border ${card.color} p-8 text-center transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer`}
                    aria-haspopup="dialog"
                    aria-expanded={isSadadModalOpen}
                    aria-controls="sadad-context-modal"
                  >
                    <div className={`h-4 w-4 rounded-full ${card.dot} ring-4 ring-background shadow-lg`} />
                    <h3 className="mt-5 text-xl font-bold text-foreground">
                      {card.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                      {card.desc}
                    </p>
                  </button>
                ) : card.key === "hawarin" ? (
                  <button
                    type="button"
                    onClick={() => setIsHawarinModalOpen(true)}
                    className={`flex h-full w-full flex-col items-center rounded-3xl border ${card.color} p-8 text-center transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer`}
                    aria-haspopup="dialog"
                    aria-expanded={isHawarinModalOpen}
                    aria-controls="hawarin-context-modal"
                  >
                    <div className={`h-4 w-4 rounded-full ${card.dot} ring-4 ring-background shadow-lg`} />
                    <h3 className="mt-5 text-xl font-bold text-foreground">
                      {card.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                      {card.desc}
                    </p>
                  </button>
                ) : card.key === "qaryatayn" ? (
                  <button
                    type="button"
                    onClick={() => setIsQaryataynModalOpen(true)}
                    className={`flex h-full w-full flex-col items-center rounded-3xl border ${card.color} p-8 text-center transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer`}
                    aria-haspopup="dialog"
                    aria-expanded={isQaryataynModalOpen}
                    aria-controls="qaryatayn-context-modal"
                  >
                    <div className={`h-4 w-4 rounded-full ${card.dot} ring-4 ring-background shadow-lg`} />
                    <h3 className="mt-5 text-xl font-bold text-foreground">
                      {card.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                      {card.desc}
                    </p>
                  </button>
                ) : (
                  <div
                    className={`flex h-full flex-col items-center rounded-3xl border ${card.color} p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className={`h-4 w-4 rounded-full ${card.dot} ring-4 ring-background shadow-lg`} />
                    <h3 className="mt-5 text-xl font-bold text-foreground">
                      {card.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                      {card.desc}
                    </p>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Memory Gallery */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <div className="text-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm text-amber-800">
              <Images className="h-4 w-4" />
              {t("galleryTag")}
            </div>
            <h2 className="mt-4 font-qomra text-4xl font-bold text-primary">
              {t("galleryTitle")}
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-stone-700">
              {t("gallerySubtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
          {galleryItems.map((item, i) => (
            <Reveal key={item.caption} delay={i * 0.05} className="break-inside-avoid">
              <figure className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
                <img
                  src={item.image}
                  alt={item.caption}
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {item.category && (
                  <span className="absolute start-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-stone-50 backdrop-blur-sm">
                    {item.category}
                  </span>
                )}
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent px-4 pb-4 pt-8 text-sm text-stone-100">
                  {item.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 text-start">
            <Link
              href="/submit-community-photo"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-background transition-colors hover:bg-primary/90"
            >
              {t("shareButton")}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-10">
              <h2 className="font-qomra text-3xl font-bold text-primary md:text-4xl">
                {isAr ? "أسئلة شائعة عن مهين" : "Frequently Asked Questions about Mheen"}
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/60">
                {isAr
                  ? "إجابات عن بعض الأسئلة المتكررة حول بلدة مهين وتاريخها وموقعها الجغرافي وسكانها."
                  : "Answers to some common questions about Mheen, its history, location, and population."}
              </p>
            </div>
          </Reveal>

          <div className="space-y-3">
            {(
              isAr
                ? [
                    {
                      q: "ما معنى اسم بلدة مهين؟",
                      a: "تتعدد الروايات حول تسمية بلدة مهين، ويُرجح الباحثون أن الاسم يعود لجذور سريانية أو آرامية قديمة تعني \"الماء\" أو \"الواحة\"، نظراً لطبيعة البلدة كواحة خضراء في قلب البادية السورية وتوفر المياه الجوفية فيها تاريخياً.",
                    },
                    {
                      q: "كم عدد سكان بلدة مهين؟",
                      a: "بلغ عدد سكان بلدة مهين حوالي 17,064 نسمة بحسب الإحصاء الرسمي لعام 2010، إلا أن هذا الرقم تعرض لتغيرات كبيرة خلال السنوات الماضية نتيجة ظروف الحرب والتهجير التي مرت بها المنطقة.",
                    },
                    {
                      q: "أين تقع بلدة مهين جغرافياً؟",
                      a: "تقع بلدة مهين في ريف محافظة حمص الجنوبي الشرقي في سوريا. تبعد عن مدينة حمص حوالي 85 كيلومتراً، وتجاورها مدينة القريتين وبلدة حوارين، وتعتبر بوابة حيوية للبادية السورية.",
                    },
                  ]
                : [
                    {
                      q: "What does the name Mheen mean?",
                      a: "The exact origin of the name Mheen is debated, but historians suggest it has ancient Syriac or Aramaic roots referring to \"water\" or \"oasis\". This reflects the town's historical nature as a green oasis with abundant groundwater in the Syrian desert.",
                    },
                    {
                      q: "What is the population of Mheen?",
                      a: "According to the official 2010 census, Mheen had a population of approximately 17,064. However, this number has fluctuated significantly in recent years due to the war and displacement in the region.",
                    },
                    {
                      q: "Where is Mheen located?",
                      a: "Mheen is located in the southeastern countryside of Homs Governorate, Syria. It is situated about 85 kilometers from the city of Homs, neighboring Al-Qaryatayn and Hawarin, and serves as a vital gateway to the Syrian Desert.",
                    },
                  ]
            ).map((item) => (
              <Reveal key={item.q} className="rounded-2xl border border-primary/10 bg-background p-5 shadow-sm">
                <details className="group">
                  <summary className="cursor-pointer list-none select-none text-base font-semibold text-foreground marker:hidden">
                    <div className="flex items-start justify-between gap-4">
                      <span>{item.q}</span>
                      <span className="mt-1 text-foreground/40 transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </div>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {isSadadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setIsSadadModalOpen(false)}
          aria-hidden="true"
        >
          <div
            id="sadad-context-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sadad-modal-title"
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsSadadModalOpen(false)}
              className="absolute end-3 top-3 rounded-full p-2 text-foreground/60 transition-colors hover:bg-black/5 hover:text-foreground"
              aria-label={mosaicI18n.closeLabel}
            >
              ✕
            </button>

            <h3 id="sadad-modal-title" className="pe-8 font-qomra text-2xl font-bold text-primary">
              {mosaicI18n.sadad.title}
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-8 text-foreground/80 md:text-base">
              <p>{mosaicI18n.sadad.p1}</p>
              <p>{mosaicI18n.sadad.p2}</p>
              <p>{mosaicI18n.sadad.p3}</p>
            </div>
          </div>
        </div>
      )}

      {isHawarinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setIsHawarinModalOpen(false)}
          aria-hidden="true"
        >
          <div
            id="hawarin-context-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hawarin-modal-title"
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsHawarinModalOpen(false)}
              className="absolute end-3 top-3 rounded-full p-2 text-foreground/60 transition-colors hover:bg-black/5 hover:text-foreground"
              aria-label={mosaicI18n.closeLabel}
            >
              ✕
            </button>

            <h3 id="hawarin-modal-title" className="pe-8 font-qomra text-2xl font-bold text-primary">
              {mosaicI18n.hawarin.title}
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-8 text-foreground/80 md:text-base">
              <p>{mosaicI18n.hawarin.p1}</p>
              <p>{mosaicI18n.hawarin.p2}</p>
              <p>{mosaicI18n.hawarin.p3}</p>
            </div>
          </div>
        </div>
      )}

      {isQaryataynModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setIsQaryataynModalOpen(false)}
          aria-hidden="true"
        >
          <div
            id="qaryatayn-context-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qaryatayn-modal-title"
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQaryataynModalOpen(false)}
              className="absolute end-3 top-3 rounded-full p-2 text-foreground/60 transition-colors hover:bg-black/5 hover:text-foreground"
              aria-label={mosaicI18n.closeLabel}
            >
              ✕
            </button>

            <h3 id="qaryatayn-modal-title" className="pe-8 font-qomra text-2xl font-bold text-primary">
              {mosaicI18n.qaryatayn.title}
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-8 text-foreground/80 md:text-base">
              <p>{mosaicI18n.qaryatayn.p1}</p>
              <p>{mosaicI18n.qaryatayn.p2}</p>
              <p>{mosaicI18n.qaryatayn.p3}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
