"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Flame, Map, Tent, HeartHandshake, type LucideIcon } from "lucide-react";

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
      },
      {
        title: "مرارة التهجير المتكرر",
        text: "مع اشتداد الحملات العسكرية وتعاقب السيطرة العسكرية على البلدة، وجد أهالي مهين أنفسهم أمام خيار وحيد للحفاظ على أرواح أطفالهم ونسائهم: النزوح. لم تكن هجرةً واحدة، بل سلسلة من موجات التهجير القسري التي مزقت النسيج الاجتماعي للبلدة. خرج الأهالي تاركين خلفهم ذكرياتهم، بيوتهم، وأرزاقهم، ليواجهوا مصيراً مجهولاً في طرقات البادية القاحلة، حاملين معهم إيمانهم بقضيتهم وجراحاً لا تندمل.",
        icon: "Map",
      },
      {
        title: "رحلة العطش: مأساة مخيم الركبان",
        text: "اتجه قسم كبير من أهالي مهين جنوباً هرباً من الموت، ليصطدموا بقساوة الصحراء في 'مخيم الركبان' على الحدود الأردنية السورية. هناك، في البقعة المنسية من العالم، عاش أبناء البلدة فصولاً من المعاناة التي تعجز الكلمات عن وصفها. واجهوا حصاراً خانقاً، وانعداماً لأبسط مقومات الحياة من ماء صالح للشرب ورعاية طبية، وعاشوا تحت خيام مهترئة لا تقي حراً ولا برداً. ورغم قسوة الرمال وشح الإمكانيات، بقي أهالي مهين في الركبان مضرباً للمثل في الصبر والتعاضد في وجه الموت البطيء.",
        icon: "Tent",
      },
      {
        title: "الشمال السوري: مخيم أبناء مهين",
        text: "أما القسم الآخر من الأهالي، فقد سلك طريق الآلام نحو الشمال السوري. وهناك، تجلت أعظم صور التلاحم والانتماء؛ حيث أبى أبناء مهين المغتربون في دول الخليج العربي أن يتركوا أهلهم وعزوتهم فريسةً لبرد المخيمات العشوائية وضياع الشتات. بهمةٍ عالية وبتبرعات سخية من المغتربين، تم تأسيس 'مخيم أبناء مهين' في الشمال. لم يكن مجرد مخيم، بل كان محاولة جادة للملمة الجراح، وجمع شمل العائلات في مكان واحد يحفظ كرامتهم، ويؤمن لهم المأوى والتعليم، ليُثبت أهالي مهين أن الجغرافيا قد تفرقهم، لكن 'الخبز والملح' والدم يجمعهم أينما حلوا.",
        icon: "HeartHandshake",
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
      },
      {
        title: "The Bitterness of Repeated Displacement",
        text: "With the intensification of military campaigns and the succession of military control over the town, the people of Mheen found themselves facing a single choice to preserve the lives of their children and women: displacement. It was not a single migration, but a series of forced displacement waves that tore the social fabric of the town. The locals left, leaving behind their memories, homes, and livelihoods, to face an unknown fate on the arid roads of the Badia, carrying with them faith in their cause and unhealed wounds.",
        icon: "Map",
      },
      {
        title: "The Journey of Thirst: The Tragedy of Rukban Camp",
        text: "A large portion of Mheen's residents headed south to escape death, only to collide with the harshness of the desert at the 'Rukban Camp' on the Syrian-Jordanian border. There, in that forgotten patch of the world, the town's people lived chapters of suffering that words fail to describe. They faced a suffocating siege, a lack of the most basic necessities of life such as safe drinking water and medical care, and lived under worn-out tents that provided no shelter from heat or cold. Despite the harshness of the sand and the scarcity of resources, the people of Mheen in Rukban remained an exemplar of patience and solidarity in the face of slow death.",
        icon: "Tent",
      },
      {
        title: "Northern Syria: The Mheen Diaspora Camp",
        text: "The other portion of the residents took the path of suffering towards northern Syria. There, the greatest images of cohesion and belonging manifested; the expatriates of Mheen in the Arab Gulf states refused to leave their families and kin as prey to the cold of makeshift camps and the loss of exile. With high determination and generous donations from the expatriates, the 'Mheen Diaspora Camp' was established in the north. It was not just a camp, but a serious attempt to heal wounds and reunite families in one place that preserves their dignity and provides them with shelter and education, proving that geography may divide them, but 'bread and salt' and blood unite them wherever they go.",
        icon: "HeartHandshake",
      },
    ],
  },
} as const;

const storyMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px -8% 0px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

export function MheenInTheLinesOfRevolution() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const currentData = isAr ? content.ar : content.en;

  const titleAccentClass = isAr
    ? "border-r-4 border-red-900 pr-4 border-l-0 pl-0"
    : "border-l-4 border-red-900 pl-4 border-r-0 pr-0";

  return (
    <section
      className="w-full bg-neutral-950 py-24 text-neutral-300"
      dir={isAr ? "rtl" : "ltr"}
      aria-labelledby="mheen-revolution-lines-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-12">
        {/* Sticky title — inline-start side follows dir (RTL: right) */}
        <header className="h-fit lg:col-span-4 lg:sticky lg:top-32">
          <h2
            id="mheen-revolution-lines-heading"
            className={`font-qomra text-4xl font-extrabold leading-tight text-white lg:text-5xl ${titleAccentClass}`}
          >
            {currentData.mainTitle}
          </h2>
        </header>

        {/* Scrolling stories */}
        <div className="flex flex-col gap-24 lg:col-span-8">
          {currentData.nodes.map((node) => {
            const Icon = ICON_MAP[node.icon] ?? Flame;
            return (
              <motion.article
                key={node.title}
                initial={storyMotion.initial}
                whileInView={storyMotion.whileInView}
                viewport={storyMotion.viewport}
                transition={storyMotion.transition}
              >
                <div className="mb-6 flex items-center gap-3">
                  <Icon
                    className="h-6 w-6 shrink-0 text-neutral-100 opacity-30"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <h3 className="text-2xl font-bold text-neutral-100">{node.title}</h3>
                </div>
                <p className="font-serif text-lg leading-loose text-neutral-400 text-justify lg:text-xl">
                  {node.text}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
