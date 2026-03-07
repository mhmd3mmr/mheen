"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, MessageCircle } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+963", country: "سوريا" },
  { code: "+966", country: "السعودية" },
  { code: "+971", country: "الإمارات" },
  { code: "+962", country: "الأردن" },
  { code: "+961", country: "لبنان" },
  { code: "+20", country: "مصر" },
  { code: "+90", country: "تركيا" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+974", country: "Qatar" },
  { code: "+965", country: "Kuwait" },
  { code: "+964", country: "Iraq" },
];

export default function ContactForm() {
  const t = useTranslations("pages.contact");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+963");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim().replace(/\s/g, "");
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedPhone || !trimmedMessage) {
      showToast("error", t("errorRequired"));
      return;
    }
    const whatsapp = `${countryCode}${trimmedPhone}`;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, whatsapp, message: trimmedMessage }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        showToast("error", data.error ?? t("errorSubmit"));
        return;
      }
      showToast("success", t("success"));
      setName("");
      setCountryCode("+963");
      setPhone("");
      setMessage("");
    } catch {
      showToast("error", t("errorSubmit"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("nameLabel")}
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="contact-whatsapp" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("whatsappLabel")}
        </label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-28 shrink-0 rounded-xl border border-primary/20 bg-background px-3 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading}
          >
            {COUNTRY_CODES.map(({ code, country }) => (
              <option key={code} value={code}>{code} {country}</option>
            ))}
          </select>
          <input
            id="contact-whatsapp"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("whatsappPlaceholder")}
            className="min-w-0 flex-1 rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("messageLabel")}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full resize-y rounded-xl border border-primary/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-background transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            {t("sending")}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t("submit")}
          </>
        )}
      </button>
      {toast && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <MessageCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{toast.text}</p>
        </div>
      )}
    </form>
  );
}
