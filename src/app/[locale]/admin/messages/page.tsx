export const runtime = "edge";

import { auth } from "@/auth";
import { getAllContactMessages } from "@/lib/api/contact";
import AdminMessagesClient from "./AdminMessagesClient";

export default async function AdminMessagesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role ?? "public";
  if (role !== "admin") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p>Only administrators can access user messages.</p>
      </div>
    );
  }

  const messages = await getAllContactMessages();
  return <AdminMessagesClient initialMessages={messages} />;
}
