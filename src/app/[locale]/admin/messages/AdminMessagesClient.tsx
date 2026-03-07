"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, ExternalLink } from "lucide-react";
import type { ContactMessageRow } from "@/lib/api/contact";

type Props = {
  initialMessages: ContactMessageRow[];
};

const STATUS_OPTIONS = [
  { value: "PENDING", key: "statusPending" },
  { value: "CONTACTED", key: "statusContacted" },
  { value: "POSTPONED", key: "statusPostponed" },
  { value: "RESOLVED", key: "statusResolved" },
  { value: "CANCELLED", key: "statusCancelled" },
] as const;

export default function AdminMessagesClient({ initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const t = useTranslations("Admin.contactMessages");

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function formatDate(ts: number | null | undefined) {
    if (!ts) return "";
    const d = new Date(ts * 1000);
    return d.toLocaleDateString("ar-SY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "PENDING":
        return t("statusPending");
      case "CONTACTED":
        return t("statusContacted");
      case "POSTPONED":
        return t("statusPostponed");
      case "RESOLVED":
        return t("statusResolved");
      case "CANCELLED":
        return t("statusCancelled");
      default:
        return status;
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        showToast(data.error ?? t("updateFailed"), "error");
        return;
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      showToast(t("updateSuccess"), "success");
    } catch {
      showToast(t("updateFailed"), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  const waUrl = (whatsapp: string) => {
    const clean = whatsapp.replace(/\D/g, "");
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="inline-flex items-center gap-2 font-qomra text-2xl font-semibold text-primary md:text-3xl">
          <MessageSquare className="h-6 w-6" />
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
      </header>

      {messages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center text-foreground/60">
          {t("noMessages")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-background shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/5">
                <th className="px-4 py-3 text-start font-medium text-foreground">{t("name")}</th>
                <th className="px-4 py-3 text-start font-medium text-foreground">{t("whatsapp")}</th>
                <th className="px-4 py-3 text-start font-medium text-foreground">{t("message")}</th>
                <th className="px-4 py-3 text-start font-medium text-foreground">{t("date")}</th>
                <th className="px-4 py-3 text-start font-medium text-foreground">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-b border-primary/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={waUrl(m.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                    >
                      {m.whatsapp}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-foreground/80 line-clamp-2" title={m.message}>
                    {m.message}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-foreground/60">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.status}
                      onChange={(e) => handleStatusChange(m.id, e.target.value)}
                      disabled={updatingId === m.id}
                      className="rounded-lg border border-primary/20 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {t(opt.key)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 end-4 z-50 rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
