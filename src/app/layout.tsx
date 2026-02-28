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
  title: "Mheen Memory Archive",
  description: "Historical documentation and memory archive",
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
