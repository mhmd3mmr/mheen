export const runtime = "edge";

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import ContactForm from "./ContactForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "بلدة مهين | تواصل معنا" : "Mheen Town | Contact Us";
  return {
    title: { absolute: title },
    openGraph: { title },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[60vh] bg-background">
      <PageHeader
        title={locale === "ar" ? "تواصل معنا" : "Contact Us"}
        subtitle={
          locale === "ar"
            ? "أرسل رسالتك وسنتواصل معك عبر واتساب"
            : "Send your message and we will get back to you via WhatsApp"
        }
      />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm />
      </main>
    </div>
  );
}
