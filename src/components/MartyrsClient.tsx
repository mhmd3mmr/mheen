"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, RotateCcw, Users, Plus, CheckCircle2, X } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { submitMartyr } from "@/app/actions/publicActions";

type Martyr = {
  id: string;
  name_ar: string;
  name_en: string;
  birth_date: string | null;
  death_date: string | null;
  bio_ar: string | null;
  bio_en: string | null;
  image_url: string | null;
};

type Props = {
  initialMartyrs: Martyr[];
  locale: string;
};

export function MartyrsClient({ initialMartyrs, locale }: Props) {
  const t = useTranslations("pages.martyrs");
  const isAr = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleMartyrSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      const formData = new FormData(e.currentTarget);
      if (imageUrl) formData.set("image_url", imageUrl);
      const result = await submitMartyr(formData);
      if (result.success) {
        setFormSuccess(true);
      } else {
        setFormError(result.error ?? "");
      }
    } catch {
      setFormError("تعذر الاتصال / Connection failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setFormSuccess(false);
    setFormError("");
    setImageUrl("");
    setUploadError("");
    formRef.current?.reset();
  }

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const m of initialMartyrs) {
      if (m.death_date) {
        const y = m.death_date.slice(0, 4);
        if (y) set.add(y);
      }
    }
    return Array.from(set).sort();
  }, [initialMartyrs]);

  const filtered = useMemo(() => {
    return initialMartyrs.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        m.name_ar.toLowerCase().includes(q) ||
        m.name_en.toLowerCase().includes(q);
      const matchesYear =
        !selectedYear || (m.death_date && m.death_date.startsWith(selectedYear));
      return matchesSearch && matchesYear;
    });
  }, [initialMartyrs, searchQuery, selectedYear]);

  const hasFilters = searchQuery || selectedYear;

  return (
    <div className="min-h-[60vh] pb-24">
      {/* Hero */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-primary px-4 pb-28 pt-16 md:-mx-8 md:-mt-8 md:px-8 md:pb-32 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/80 via-primary to-primary" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-qomra text-4xl font-bold text-white md:text-5xl lg:text-6xl"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 max-w-lg text-base text-white/70 md:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-6 py-3 backdrop-blur-sm"
            >
              <Users className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-white">
                {initialMartyrs.length}
              </span>
              <span className="text-sm text-white/70">{t("total")}</span>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              onClick={() => { setShowForm(!showForm); setFormSuccess(false); setFormError(""); }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-accent px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-accent/90"
            >
              <Plus className="h-4 w-4" />
              {t("addMartyr")}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 mx-auto -mt-10 max-w-3xl px-4"
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-background p-4 shadow-lg sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-primary/15 bg-background py-2.5 ps-10 pe-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-lg border border-primary/15 bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{t("allYears")}</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedYear(""); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-primary/5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("resetFilters")}
            </button>
          )}
        </div>
      </motion.div>

      {/* Inline Submit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-2xl overflow-hidden px-4"
          >
            <div className="mt-8 rounded-2xl border border-primary/10 bg-background p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-qomra text-lg font-semibold text-primary">{t("addMartyr")}</h2>
                  <p className="text-xs text-foreground/60">{t("addMartyrDesc")}</p>
                </div>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-primary/5 hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formSuccess ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
                  <p className="mt-3 font-semibold text-green-800">{t("successMsg")}</p>
                  <button onClick={resetForm} className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-background hover:bg-primary/90">
                    {t("sendAnother")}
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleMartyrSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/70">{t("nameAr")}</label>
                      <input name="name_ar" required className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/70">{t("nameEn")}</label>
                      <input name="name_en" className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/70">{t("birthDate")}</label>
                      <input type="date" name="birth_date" className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground/70">{t("deathDate")}</label>
                      <input type="date" name="death_date" className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/70">{t("bioAr")}</label>
                    <textarea name="bio_ar" rows={2} className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/70">{t("photo")}</label>
                    <FileUpload
                      accept="image/*"
                      onUploadSuccess={(url) => { setImageUrl(url); setUploadError(""); }}
                      onUploadingChange={setIsUploading}
                      onUploadError={setUploadError}
                    />
                    {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
                    {imageUrl && <img src={imageUrl} alt="" className="mt-2 h-16 w-16 rounded-lg border object-cover" />}
                    <input type="hidden" name="image_url" value={imageUrl} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/70">{t("submitter")}</label>
                    <input name="submitted_by" className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>}
                  <div className="flex gap-3">
                    <button type="submit" disabled={isSubmitting || isUploading} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background hover:bg-primary/90 disabled:opacity-60">
                      {isSubmitting ? "..." : t("send")}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-primary/15 px-4 py-2.5 text-sm text-foreground/70 hover:bg-primary/5">
                      {t("cancel")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="mx-auto mt-10 max-w-6xl px-4">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((m, i) => (
                <MartyrCard
                  key={m.id}
                  martyr={m}
                  isAr={isAr}
                  index={i}
                  bornLabel={t("born")}
                  diedLabel={t("died")}
                />
              ))}
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-primary/10 bg-background/50 p-10 text-center text-foreground/60"
            >
              {hasFilters ? t("noResults") : t("noRecords")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MartyrCard({
  martyr: m,
  isAr,
  index,
  bornLabel,
  diedLabel,
}: {
  martyr: Props["initialMartyrs"][number];
  isAr: boolean;
  index: number;
  bornLabel: string;
  diedLabel: string;
}) {
  const name = isAr ? m.name_ar : m.name_en;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-80 flex-col overflow-hidden rounded-xl border border-primary/10 bg-background shadow-sm transition-shadow hover:shadow-lg"
    >
      {/* Image area */}
      <div className="relative h-52 shrink-0 overflow-hidden bg-primary/5">
        {m.image_url ? (
          <img
            src={m.image_url}
            alt={name}
            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <svg
              className="h-20 w-20 text-primary/15"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {/* Name on overlay */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <h3 className="font-qomra text-base font-bold leading-tight text-white drop-shadow-sm md:text-lg">
            {name}
          </h3>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col justify-center gap-1.5 px-4 py-3">
        {m.death_date && (
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/50" />
            <span>
              {diedLabel}: {m.death_date}
            </span>
          </div>
        )}
        {m.birth_date && (
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/50" />
            <span>
              {bornLabel}: {m.birth_date}
            </span>
          </div>
        )}
        {(m.bio_ar || m.bio_en) && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/70">
            {isAr ? (m.bio_ar || m.bio_en) : (m.bio_en || m.bio_ar)}
          </p>
        )}
      </div>
    </motion.article>
  );
}
