"use client";

export const runtime = 'edge';

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/FileUpload";
import { CheckCircle2 } from "lucide-react";

export default function SubmitCommunityPhotoPage() {
  const t = useTranslations("pages.communitySubmit");
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (imageUrl) formData.set("image_url", imageUrl);
      const res = await fetch("/api/community-photos", {
        method: "POST",
        body: formData,
      });
      const result = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && result.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(result.error ?? t("error"));
      }
    } catch {
      setErrorMessage(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setIsSuccess(false);
    setImageUrl("");
    setUploadError("");
    setErrorMessage("");
    formRef.current?.reset();
  }

  if (isSuccess) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
          >
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-4 font-qomra text-2xl font-semibold text-emerald-800">
              {t("successTitle")}
            </h1>
            <p className="mt-2 text-emerald-800/80">{t("successText")}</p>
            <button
              onClick={resetForm}
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary/90"
            >
              {t("submitAnother")}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-qomra text-3xl font-semibold text-primary md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/80">{t("subtitle")}</p>

        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-5 rounded-xl border border-primary/10 bg-background/60 p-6"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("name")}</label>
            <input
              required
              name="submitted_by_name"
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("email")}</label>
            <input
              required
              type="email"
              name="submitted_by_email"
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("photoTitleAr")}</label>
            <input
              required
              name="title_ar"
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("photoTitleEn")}</label>
            <input
              required
              name="title_en"
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("photo")}</label>
            <FileUpload
              accept="image/*"
              folder="community"
              onUploadSuccess={(url) => {
                setImageUrl(url);
                setUploadError("");
              }}
              onUploadingChange={setIsUploading}
              onUploadError={setUploadError}
              uploadLabel={t("upload")}
              uploadingLabel={t("uploading")}
            />
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-2 h-24 w-24 rounded-lg border border-primary/10 object-cover"
              />
            )}
            <input type="hidden" name="image_url" value={imageUrl} />
          </div>

          {errorMessage && (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? "..." : t("submit")}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
