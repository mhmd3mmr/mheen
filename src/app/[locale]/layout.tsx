import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SessionProvider } from "@/components/SessionProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  const title = isAr ? "بلدة مهين" : "Mheen Town";
  const description = isAr
    ? "بلدة مهين واحة البادية السورية في ريف حمص."
    : "Mheen town, the oasis of the Syrian Badia in Homs countryside.";
  const pageUrl = `https://miheen.com/${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        ar: "https://miheen.com/ar",
        en: "https://miheen.com/en",
      },
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      title,
      description,
      locale: isAr ? "ar_SY" : "en_US",
      siteName: isAr ? "بلدة مهين" : "Mheen Town",
      images: [
        {
          url: "https://miheen.com/images/mheen-oasis-city.webp",
          width: 1200,
          height: 630,
          alt: isAr ? "بلدة مهين - ريف حمص" : "Mheen town - Homs countryside",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://miheen.com/images/mheen-oasis-city.webp"],
    },
  };
}

/**
 * Locale layout: provides messages, Navbar, Footer, and SessionProvider.
 * Main has flex-1 so the footer stays at the bottom.
 */
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
