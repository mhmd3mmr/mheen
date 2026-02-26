export const runtime = "edge";

import { setRequestLocale } from "next-intl/server";
import { getPublicMartyrs } from "@/app/actions/publicActions";
import { MartyrsClient } from "@/components/MartyrsClient";

type Props = { params: Promise<{ locale: string }> };

export default async function MartyrsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const martyrsList = await getPublicMartyrs();

  return <MartyrsClient initialMartyrs={martyrsList} locale={locale} />;
}
