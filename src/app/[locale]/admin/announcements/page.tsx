export const runtime = "edge";

import { auth } from "@/auth";
import { getAnnouncements } from "@/lib/api/announcements";
import AdminAnnouncementsClient from "./AdminAnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role ?? "public";
  const userId = (session?.user as { id?: string } | null)?.id ?? "";
  const announcements =
    role === "editor" && userId
      ? await getAnnouncements(50, 0, userId)
      : await getAnnouncements(50, 0);

  return (
    <AdminAnnouncementsClient
      initialAnnouncements={announcements}
      role={role}
    />
  );
}

