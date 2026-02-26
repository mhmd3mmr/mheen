"use client";

export const runtime = 'edge';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitForm } from "./SubmitForm";
import { SubmitMartyrForm } from "./SubmitMartyrForm";
import { SubmitDetaineeForm } from "./SubmitDetaineeForm";
import { BookOpen, Heart, ShieldAlert } from "lucide-react";

const TABS = ["story", "martyr", "detainee"] as const;
type Tab = (typeof TABS)[number];

export default function SubmitPage() {
  const t = useTranslations("pages.submit");
  const [activeTab, setActiveTab] = useState<Tab>("story");
  const [errorMessage, setErrorMessage] = useState("");

  const tabConfig = {
    story: { label: t("tabStory"), icon: BookOpen },
    martyr: { label: t("tabMartyr"), icon: Heart },
    detainee: { label: t("tabDetainee"), icon: ShieldAlert },
  };

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setErrorMessage("");
  }

  return (
    <div className="p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <h1 className="font-qomra text-3xl font-semibold text-primary md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/80">{t("subtitle")}</p>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-xl border border-primary/10 bg-primary/5 p-1">
          {TABS.map((tab) => {
            const Icon = tabConfig[tab].icon;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-background text-primary shadow-sm"
                    : "text-foreground/60 hover:text-foreground/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tabConfig[tab].label}</span>
              </button>
            );
          })}
        </div>

        {/* Forms */}
        <div className="mt-6">
          {activeTab === "story" && <SubmitForm onError={setErrorMessage} />}
          {activeTab === "martyr" && <SubmitMartyrForm onError={setErrorMessage} />}
          {activeTab === "detainee" && <SubmitDetaineeForm onError={setErrorMessage} />}
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
