export const runtime = "edge";

import Script from "next/script";
import CommunityPage from "../community/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutMheenPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const baseUrl = "https://miheen.com";
  const aboutUrl = `${baseUrl}/${locale}/about-mheen`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: isAr
      ? [
          {
            "@type": "Question",
            name: "ما معنى اسم بلدة مهين؟",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "تتعدد الروايات حول تسمية بلدة مهين، ويُرجح الباحثون أن الاسم يعود لجذور سريانية أو آرامية قديمة تعني \"الماء\" أو \"الواحة\"، نظراً لطبيعة البلدة كواحة خضراء في قلب البادية السورية وتوفر المياه الجوفية فيها تاريخياً.",
            },
          },
          {
            "@type": "Question",
            name: "كم عدد سكان بلدة مهين؟",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "بلغ عدد سكان بلدة مهين حوالي 17,064 نسمة بحسب الإحصاء الرسمي لعام 2010، إلا أن هذا الرقم تعرض لتغيرات كبيرة خلال السنوات الماضية نتيجة ظروف الحرب والتهجير التي مرت بها المنطقة.",
            },
          },
          {
            "@type": "Question",
            name: "أين تقع بلدة مهين جغرافياً؟",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "تقع بلدة مهين في ريف محافظة حمص الجنوبي الشرقي في سوريا. تبعد عن مدينة حمص حوالي 85 كيلومتراً، وتجاورها مدينة القريتين وبلدة حوارين، وتعتبر بوابة حيوية للبادية السورية.",
            },
          },
        ]
      : [
          {
            "@type": "Question",
            name: "What does the name Mheen mean?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "The exact origin of the name Mheen is debated, but historians suggest it has ancient Syriac or Aramaic roots referring to \"water\" or \"oasis\". This reflects the town's historical nature as a green oasis with abundant groundwater in the Syrian desert.",
            },
          },
          {
            "@type": "Question",
            name: "What is the population of Mheen?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "According to the official 2010 census, Mheen had a population of approximately 17,064. However, this number has fluctuated significantly in recent years due to the war and displacement in the region.",
            },
          },
          {
            "@type": "Question",
            name: "Where is Mheen located?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Mheen is located in the southeastern countryside of Homs Governorate, Syria. It is situated about 85 kilometers from the city of Homs, neighboring Al-Qaryatayn and Hawarin, and serves as a vital gateway to the Syrian Desert.",
            },
          },
        ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isAr ? "الرئيسية" : "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isAr ? "عن مهين" : "About Mheen",
        item: aboutUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id="schema-org-faq-about-mheen"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="schema-org-breadcrumb-about-mheen"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CommunityPage />
    </>
  );
}
