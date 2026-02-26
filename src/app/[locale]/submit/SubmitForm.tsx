"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/FileUpload";

type SubmitFormProps = {
  onError?: (message: string) => void;
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export function SubmitForm({ onError }: SubmitFormProps) {
  const t = useTranslations("pages.submit");
  const [consent, setConsent] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onError?.("");
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      if (imageUrl) formData.set("image_url", imageUrl);
      const response = await fetch("/api/stories/submit", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (response.ok && result.success) {
        setIsSuccess(true);
      } else {
        onError?.(result.error ?? "Database connection failed. Please try again later.");
      }
    } catch (err) {
      console.error("Submit failed:", err);
      onError?.("Database connection failed. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="font-qomra text-xl font-medium text-primary md:text-2xl">
          {t("successMessage")}
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSuccess(false);
            setImageUrl("");
            setConsent(false);
            formRef.current?.reset();
          }}
          className="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          {t("submitAnother")}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      ref={formRef}
      className="mt-10 space-y-6"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={fadeUp.transition}
      onSubmit={handleSubmit}
    >
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
          {t("name")}
        </label>
        <input
          id="name"
          name="author_name"
          type="text"
          required
          className="w-full rounded-lg border border-primary/20 bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-lg border border-primary/20 bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="story" className="mb-2 block text-sm font-medium text-foreground">
          {t("story")}
        </label>
        <textarea
          id="story"
          name="content"
          rows={6}
          required
          className="w-full rounded-lg border border-primary/20 bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">{t("upload")}</label>
        <FileUpload
          onUploadSuccess={(url) => { setImageUrl(url); setUploadError(""); }}
          onUploadingChange={setIsUploadingFile}
          onUploadError={setUploadError}
          uploadLabel={t("upload")}
          uploadingLabel={t("uploading")}
        />
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
        {imageUrl && (
          <div className="mt-3">
            <p className="mb-2 text-sm text-foreground/70">Preview</p>
            {imageUrl.includes("/api/upload?key=") || /\.(jpe?g|png|gif|webp)(\?|$)/i.test(imageUrl) ? (
              <img
                src={imageUrl}
                alt="Upload preview"
                className="h-24 w-24 rounded-lg border border-primary/20 object-cover"
              />
            ) : (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                View uploaded file
              </a>
            )}
          </div>
        )}
      </div>
      <input type="hidden" name="image_url" value={imageUrl} />
      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
        />
        <label htmlFor="consent" className="text-sm text-foreground/80">
          {t("consent")}
        </label>
      </div>
      <button
        type="submit"
        disabled={!consent || isSubmitting || isUploadingFile}
        className="w-full rounded-lg bg-primary px-6 py-3.5 font-medium text-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 sm:w-auto sm:px-10"
      >
        {isSubmitting ? "…" : t("submit")}
      </button>
    </motion.form>
  );
}
