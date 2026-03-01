export const runtime = "edge";

import { redirect } from "next/navigation";

export default async function AdminMartyrsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/record-of-honor`);
}
