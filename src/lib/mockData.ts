/**
 * Mock bilingual data for Mheen Memory Archive.
 * Used across About, Martyrs, Detainees, Timeline, Stories, and related pages.
 */

export const aboutData = {
  location: {
    ar: "محافظة حمص، ريف حمص الشرقي، قرب صدد والقريتين وحوارين",
    en: "Homs Governorate, Eastern Countryside, near Sadad, Al-Qaryatayn, and Huwwarin",
  },
  population: {
    ar: "حوالي 20 ألف نسمة قبل 2011. المهن الأساسية: الزراعة، تربية المواشي، والاغتراب.",
    en: "Around 20,000 before 2011. Main professions: Agriculture, livestock, and expatriation.",
  },
};

export const martyrs = [
  {
    id: "1",
    nameAr: "أحمد محمد العلي",
    nameEn: "Ahmad Muhammad Al-Ali",
    date: "2013",
    bioAr: "استشهد خلال الدفاع عن البلدة. كان مزارعًا ومتطوعًا في الدفاع المدني.",
    bioEn: "Fell defending the town. He was a farmer and a volunteer in civil defense.",
  },
  {
    id: "2",
    nameAr: "فاطمة حسن",
    nameEn: "Fatima Hassan",
    date: "2014",
    bioAr: "استشهدت مع أسرتها أثناء النزوح. معلمة سابقة في مدرسة البلدة.",
    bioEn: "Fell with her family during displacement. A former teacher at the town school.",
  },
  {
    id: "3",
    nameAr: "خالد إبراهيم",
    nameEn: "Khalid Ibrahim",
    date: "2015",
    bioAr: "استشهد في معارك محيط المستودعات. كان من أبرز الشباب المتطوعين.",
    bioEn: "Fell in battles around the depots. He was among the most active young volunteers.",
  },
];

export const detainees = [
  {
    id: "1",
    nameAr: "محمود سعيد",
    nameEn: "Mahmoud Saeed",
    arrestDate: "2012",
    statusAr: "مفقود منذ الاعتقال",
    statusEn: "Missing since arrest",
  },
  {
    id: "2",
    nameAr: "سارة علي",
    nameEn: "Sara Ali",
    arrestDate: "2014",
    statusAr: "محكوم — مكان الاحتجاز غير معروف",
    statusEn: "Sentenced — place of detention unknown",
  },
  {
    id: "3",
    nameAr: "يوسف أحمد",
    nameEn: "Youssef Ahmad",
    arrestDate: "2015",
    statusAr: "قيد التحقيق — لا معلومات حديثة",
    statusEn: "Under investigation — no recent information",
  },
];

export const timeline = [
  {
    year: "2011",
    titleAr: "بداية الأحداث والمظاهرات السلمية",
    titleEn: "The beginning of events and peaceful protests",
  },
  {
    year: "2013-2015",
    titleAr: "الاجتياحات والمعارك حول مستودعات الأسلحة الكبرى في البلدة",
    titleEn: "Military events and battles around major weapon depots",
  },
  {
    year: "2015",
    titleAr: "النزوح الكبير للأهالي نحو الصحراء والحدود",
    titleEn: "Mass displacement of residents towards the desert and borders",
  },
  {
    year: "2017-2018",
    titleAr: "بداية العودة والنظر إلى المستقبل",
    titleEn: "The beginning of return and looking to the future",
  },
];

export const stories = [
  {
    id: "1",
    titleAr: "ليلة الخروج",
    titleEn: "The Night We Left",
    excerptAr: "لم نصدق أننا نغادر. البيت، الأرض، الذكريات — كل شيء بقي خلفنا.",
    excerptEn: "We couldn't believe we were leaving. The house, the land, the memories — everything stayed behind.",
    date: "2015",
    authorAr: "شاهد عيان",
    authorEn: "Eyewitness",
  },
  {
    id: "2",
    titleAr: "أيام الدفاع",
    titleEn: "Days of Defense",
    excerptAr: "كنا نسمع أصوات القذائف ليل نهار. الشباب كانوا في المقدمة.",
    excerptEn: "We heard shelling day and night. The youth were at the front.",
    date: "2014",
    authorAr: "متطوع سابق",
    authorEn: "Former volunteer",
  },
  {
    id: "3",
    titleAr: "العودة الأولى",
    titleEn: "The First Return",
    excerptAr: "عندما عدنا، لم نجد سوى الحطام. لكن الأرض ما زالت أرضنا.",
    excerptEn: "When we returned, we found only rubble. But the land was still ours.",
    date: "2018",
    authorAr: "نازح عائد",
    authorEn: "Returned displaced",
  },
];
