import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleDirection } from "@/components/LocaleDirection";

/** Qomra: use the thicker 600 cut as base site font. */
const qomra = localFont({
  src: [
    { path: "./fonts/Qomra-600.otf", weight: "400" },
    { path: "./fonts/Qomra-600.otf", weight: "700" },
  ],
  variable: "--font-qomra",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://miheen.com"),
  title: {
    default: "Mheen Memory Archive | أرشيف ذاكرة مهين",
    template: "%s | Mheen Memory Archive",
  },
  description:
    "Mheen Memory Archive documents the history, people, martyrs, detainees, and stories of Mheen in Homs countryside, Syria. أرشيف يوثق مهين وريف حمص وسوريا.",
  keywords: [
    "Mheen",
    "Maheen",
    "Miheen",
    "Mahin",
    "مهين",
    "ريف حمص",
    "حمص",
    "Homs",
    "Syria",
    "سوريا",
    "سورية",
    "Mheen Archive",
    "Mheen Memory Archive",
    "أرشيف مهين",
    "أرشيف ذاكرة مهين",
  ],
  alternates: {
    canonical: "https://miheen.com",
    languages: {
      ar: "https://miheen.com/ar",
      en: "https://miheen.com/en",
    },
  },
  openGraph: {
    type: "website",
    url: "https://miheen.com",
    siteName: "Mheen Memory Archive",
    title: "Mheen Memory Archive | أرشيف ذاكرة مهين",
    description:
      "Historical documentation and community memory archive for Mheen, Homs countryside, Syria.",
    images: [
      {
        url: "/images/mheen-oasis-city.png",
        width: 1200,
        height: 630,
        alt: "Mheen - Homs countryside, Syria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mheen Memory Archive | أرشيف ذاكرة مهين",
    description:
      "Historical documentation and community memory archive for Mheen, Homs countryside, Syria.",
    images: ["/images/mheen-oasis-city.png"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

/**
 * Root layout: global styles and RTL/LTR sync.
 * Direction and lang are set client-side from [locale] segment (see LocaleDirection).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${qomra.variable} antialiased font-qomra`}>
        <LocaleDirection />
        {children}
      </body>
    </html>
  );
}
