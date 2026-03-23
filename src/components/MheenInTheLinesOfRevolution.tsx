"use client";

import { useLocale } from "next-intl";
import { Flame, Map, Tent, HeartHandshake, type LucideIcon } from "lucide-react";
import { FadeUp } from "@/components/FadeUp";

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Map,
  Tent,
  HeartHandshake,
};

const content = {
  ar: {
    mainTitle: "ضريبة الكرامة: من قوافل الشهداء إلى قساوة الشتات",
    nodes: [
      {
        title: "شرارة الكرامة وقوافل الشهداء",
        text: "لم تكن مهين يوماً على هامش التاريخ، وحين نادت الثورة السورية بالكرامة، كانت من أوائل الملبيّن. دفعت البلدة فاتورةً باهظة لموقعها الاستراتيجي في قلب البادية؛ فتعرضت لحصار خانق، وقصف ممنهج، واجتياحات عسكرية متكررة. ورغم قسوة الآلة العسكرية، سطر أبناؤها ملاحم في الصمود، وقدمت مهين خيرة شبابها قوافل من الشهداء الأبرار الذين رووا بدمائهم تراب البادية، إضافة إلى مئات المعتقلين والمغيبين قسراً في أقبية السجون، ليصبح كل بيت في مهين يحمل قصة تضحية لا تُنسى.",
        icon: "Flame",
        accent: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200",
      },
      {
        title: "مرارة التهجير المتكرر",
        text: "مع اشتداد الحملات العسكرية وتعاقب السيطرة العسكرية على البلدة، وجد أهالي مهين أنفسهم أمام خيار وحيد للحفاظ على أرواح أطفالهم ونسائهم: النزوح. لم تكن هجرةً واحدة، بل سلسلة من موجات التهجير القسري التي مزقت النسيج الاجتماعي للبلدة. خرج الأهالي تاركين خلفهم ذكرياتهم، بيوتهم، وأرزاقهم، ليواجهوا مصيراً مجهولاً في طرقات البادية القاحلة، حاملين معهم إيمانهم بقضيتهم وجراحاً لا تندمل.",
        icon: "Map",
        accent: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
      },
      {
        title: "رحلة العطش: مأساة مخيم الركبان",
        text: "اتجه قسم كبير من أهالي مهين جنوباً هرباً من الموت، ليصطدموا بقساوة الصحراء في 'مخيم الركبان' على الحدود الأردنية السورية. هناك، في البقعة المنسية من العالم، عاش أبناء البلدة فصولاً من المعاناة التي تعجز الكلمات عن وصفها. واجهوا حصاراً خانقاً، وانعداماً لأبسط مقومات الحياة من ماء صالح للشرب ورعاية طبية، وعاشوا تحت خيام مهترئة لا تقي حراً ولا برداً. ورغم قسوة الرمال وشح الإمكانيات، بقي أهالي مهين في الركبان مضرباً للمثل في الصبر والتعاضد في وجه الموت البطيء.",
        icon: "Tent",
        accent: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
      },
      {
        title: "الشمال السوري: مخيم أبناء مهين",
        text: "أما القسم الآخر من الأهالي، فقد سلك طريق الآلام نحو الشمال السوري. وهناك، تجلت أعظم صور التلاحم والانتماء؛ حيث أبى أبناء مهين المغتربون في دول الخليج العربي أن يتركوا أهلهم وعزوتهم فريسةً لبرد المخيمات العشوائية وضياع الشتات. بهمةٍ عالية وبتبرعات سخية من المغتربين، تم تأسيس 'مخيم أبناء مهين' في الشمال. لم يكن مجرد مخيم، بل كان محاولة جادة للملمة الجراح، وجمع شمل العائلات في مكان واحد يحفظ كرامتهم، ويؤمن لهم المأوى والتعليم، ليُثبت أهالي مهين أن الجغرافيا قد تفرقهم، لكن 'الخبز والملح' والدم يجمعهم أينما حلوا.",
        icon: "HeartHandshake",
        accent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
      },
    ],
  },
  en: {
    mainTitle: "The Toll of Dignity: From Convoys of Martyrs to the Cruelty of Exile",
    nodes: [
      {
        title: "The Spark of Dignity and Convoys of Martyrs",
        text: "Mheen was never on the margins of history. When the Syrian Revolution called for dignity, it was among the first to respond. The town paid a heavy price for its strategic location in the heart of the Badia, enduring suffocating sieges, systematic shelling, and repeated military incursions. Despite the brutality of the military machine, its people wrote epics of resilience. Mheen offered its finest youth as convoys of righteous martyrs who watered the soil of the Badia with their blood, in addition to hundreds of detainees and forcibly disappeared persons in the dungeons of prisons. Every house in Mheen now carries an unforgettable story of sacrifice.",
        icon: "Flame",
        accent: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200",
      },
      {
        title: "The Bitterness of Repeated Displacement",
        text: "With the intensification of military campaigns and the succession of military control over the town, the people of Mheen found themselves facing a single choice to preserve the lives of their children and women: displacement. It was not a single migration, but a series of forced displacement waves that tore the social fabric of the town. The locals left, leaving behind their memories, homes, and livelihoods, to face an unknown fate on the arid roads of the Badia, carrying with them faith in their cause and unhealed wounds.",
        icon: "Map",
        accent: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
      },
      {
        title: "The Journey of Thirst: The Tragedy of Rukban Camp",
        text: "A large portion of Mheen's residents headed south to escape death, only to collide with the harshness of the desert at the 'Rukban Camp' on the Syrian-Jordanian border. There, in that forgotten patch of the world, the town's people lived chapters of suffering that words fail to describe. They faced a suffocating siege, a lack of the most basic necessities of life such as safe drinking water and medical care, and lived under worn-out tents that provided no shelter from heat or cold. Despite the harshness of the sand and the scarcity of resources, the people of Mheen in Rukban remained an exemplar of patience and solidarity in the face of slow death.",
        icon: "Tent",
        accent: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
      },
      {
        title: "Northern Syria: The Mheen Diaspora Camp",
        text: "The other portion of the residents took the path of suffering towards northern Syria. There, the greatest images of cohesion and belonging manifested; the expatriates of Mheen in the Arab Gulf states refused to leave their families and kin as prey to the cold of makeshift camps and the loss of exile. With high determination and generous donations from the expatriates, the 'Mheen Diaspora Camp' was established in the north. It was not just a camp, but a serious attempt to heal wounds and reunite families in one place that preserves their dignity and provides them with shelter and education, proving that geography may divide them, but 'bread and salt' and blood unite them wherever they go.",
        icon: "HeartHandshake",
        accent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
      },
    ],
  },
} as const;

export function MheenInTheLinesOfRevolution() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const currentData = isAr ? content.ar : content.en;

  return (
    <section
      className="bg-gray-50 py-16 text-foreground dark:bg-gray-900 md:py-24"
      dir={isAr ? "rtl" : "ltr"}
      aria-labelledby="mheen-revolution-lines-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <FadeUp>
          <h2
            id="mheen-revolution-lines-heading"
            className="mb-12 text-center font-qomra text-3xl font-bold text-primary md:text-4xl"
          >
            {currentData.mainTitle}
          </h2>
        </FadeUp>

        <div className="relative">
          {/* Center vertical line — desktop only */}
          <div
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-slate-300 dark:bg-slate-600 md:block"
            aria-hidden="true"
          />

          <div className="space-y-10 md:space-y-14">
            {currentData.nodes.map((node, i) => {
              const Icon = ICON_MAP[node.icon] ?? Flame;
              const cardOnEnd = i % 2 === 0;

              return (
                <FadeUp key={node.title} delay={0.08 + i * 0.08}>
                  <article className="relative md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 md:gap-y-0">
                    {/* Mobile: stacked card + icon row */}
                    <div className="md:hidden">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-slate-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${node.accent} shadow-sm ring-4 ring-gray-50 dark:ring-gray-900`}
                          >
                            <Icon className="h-5 w-5" aria-hidden />
                          </div>
                          <h3 className="text-lg font-bold text-foreground">{node.title}</h3>
                        </div>
                        <p className="text-justify text-sm leading-relaxed text-foreground/80">
                          {node.text}
                        </p>
                      </div>
                    </div>

                    {/* Desktop: alternating */}
                    <div className="hidden md:contents">
                      {cardOnEnd ? (
                        <>
                          <div className="min-h-[1px]" />
                          <div className="relative flex justify-center pt-1">
                            <div
                              className={`z-10 flex h-14 w-14 items-center justify-center rounded-full ${node.accent} shadow-md ring-8 ring-gray-50 dark:ring-gray-900`}
                            >
                              <Icon className="h-6 w-6" aria-hidden />
                            </div>
                          </div>
                          <div className="flex items-stretch">
                            <div
                              className={`max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-slate-700 dark:bg-gray-800 ${
                                isAr ? "me-auto" : "ms-auto"
                              }`}
                            >
                              <h3 className="text-xl font-bold text-foreground">{node.title}</h3>
                              <p className="mt-4 text-justify text-base leading-relaxed text-foreground/80">
                                {node.text}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-stretch">
                            <div
                              className={`max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-slate-700 dark:bg-gray-800 ${
                                isAr ? "ms-auto" : "me-auto"
                              }`}
                            >
                              <h3 className="text-xl font-bold text-foreground">{node.title}</h3>
                              <p className="mt-4 text-justify text-base leading-relaxed text-foreground/80">
                                {node.text}
                              </p>
                            </div>
                          </div>
                          <div className="relative flex justify-center pt-1">
                            <div
                              className={`z-10 flex h-14 w-14 items-center justify-center rounded-full ${node.accent} shadow-md ring-8 ring-gray-50 dark:ring-gray-900`}
                            >
                              <Icon className="h-6 w-6" aria-hidden />
                            </div>
                          </div>
                          <div className="min-h-[1px]" />
                        </>
                      )}
                    </div>
                  </article>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
