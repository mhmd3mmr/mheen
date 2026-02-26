"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/FileUpload";
import { CheckCircle2 } from "lucide-react";

type Props = { onError?: (msg: string) => void };

export function SubmitDetaineeForm({ onError }: Props) {
  const t = useTranslations("pages.submit");
  const formRef = useRef<HTMLFormElement>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onError?.("");
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (imageUrl) formData.set("image_url", imageUrl);
      const response = await fetch("/api/detainees", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (response.ok && result.success) {
        setIsSuccess(true);
      } else {
        onError?.(result.error ?? "حدث خطأ غير متوقع / Unexpected error");
      }
    } catch {
      onError?.("تعذر الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً. / Database connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setIsSuccess(false);
    setImageUrl("");
    setUploadError("");
    formRef.current?.reset();
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-green-200 bg-green-50 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <p className="mt-4 text-lg font-semibold text-green-800">{t("successMessage")}</p>
        <button
          onClick={handleReset}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary/90"
        >
          {t("submitAnother")}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 rounded-xl border border-primary/10 bg-background/60 p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">{t("detaineeName")} *</label>
          <input
            name="name_ar"
            required
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">{t("detaineeNameEn")}</label>
          <input
            name="name_en"
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">{t("arrestDate")}</label>
        <input
          type="date"
          name="arrest_date"
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">{t("detaineeStatusAr")}</label>
        <textarea
          name="status_ar"
          rows={2}
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">{t("detaineeStatusEn")}</label>
        <textarea
          name="status_en"
          rows={2}
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">{t("photo")}</label>
        <FileUpload
          accept="image/*"
          onUploadSuccess={(url) => { setImageUrl(url); setUploadError(""); }}
          onUploadingChange={setIsUploading}
          onUploadError={setUploadError}
          uploadLabel={t("upload")}
          uploadingLabel={t("uploading")}
        />
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="mt-2 h-20 w-20 rounded-lg border border-primary/10 object-cover" />
        )}
        <input type="hidden" name="image_url" value={imageUrl} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">{t("submitterName")}</label>
        <input
          name="submitted_by"
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {isSubmitting ? "..." : t("submit")}
      </button>
    </motion.form>
  );
}
