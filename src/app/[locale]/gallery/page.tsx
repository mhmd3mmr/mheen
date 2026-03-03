export const runtime = 'edge';

import { setRequestLocale } from "next-intl/server";
import { GalleryTabsClient } from "@/components/GalleryTabsClient";

type Props = { params: Promise<{ locale: string }> };

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GalleryTabsClient />;
}
