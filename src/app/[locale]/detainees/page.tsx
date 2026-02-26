export const runtime = "edge";

import { setRequestLocale } from "next-intl/server";
import { getPublicDetainees } from "@/app/actions/publicActions";
import { DetaineesClient } from "@/components/DetaineesClient";

type Props = { params: Promise<{ locale: string }> };

export default async function DetaineesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const detaineesList = await getPublicDetainees();

  return <DetaineesClient initialDetainees={detaineesList} locale={locale} />;
}
