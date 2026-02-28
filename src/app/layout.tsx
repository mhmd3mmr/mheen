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
    default: "بلدة مهين | Mheen Town",
    template: "%s | بلدة مهين",
  },
  description:
    "بلدة مهين واحة البادية السورية في ريف حمص. Mheen town, the oasis of the Syrian Badia in Homs countryside.",
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
    siteName: "بلدة مهين | Mheen Town",
    title: "بلدة مهين | Mheen Town",
    description:
      "بلدة مهين واحة البادية السورية في ريف حمص. Mheen town, the oasis of the Syrian Badia in Homs countryside.",
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
    title: "بلدة مهين | Mheen Town",
    description:
      "بلدة مهين واحة البادية السورية في ريف حمص. Mheen town, the oasis of the Syrian Badia in Homs countryside.",
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
