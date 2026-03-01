export const runtime = 'edge';

import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function MartyrsPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/record-of-honor`);
}
