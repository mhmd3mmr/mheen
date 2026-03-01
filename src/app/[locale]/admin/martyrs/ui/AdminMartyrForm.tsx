"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";

export function AdminMartyrForm() {
  const tAdmin = useTranslations("Admin");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [method, setMethod] = useState("combatant");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData(e.currentTarget);
      if (imageUrl) formData.set("image_url", imageUrl);
      formData.set("martyrdom_method", method);
      formData.set("desired_status", "approved");
      const response = await fetch("/api/martyrs", { method: "POST", body: formData });
      const result = (await response.json()) as { success?: boolean; error?: string };

      if (response.ok && result.success) {
        setSuccessMsg("تمت الإضافة بنجاح / Added successfully");
        formRef.current?.reset();
        setImageUrl("");
        setMethod("combatant");
        router.refresh();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(result.error ?? "Failed to add martyr");
      }
    } catch {
      setErrorMsg("حدث خطأ غير متوقع / Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-primary/10 bg-background/60 p-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/80">
          الاسم (عربي)
        </label>
        <input
          name="name_ar"
          required
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/80">
          Name (English)
        </label>
        <input
          name="name_en"
          required
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/80">
          تاريخ الميلاد
        </label>
        <input
          type="date"
          name="birth_date"
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/80">
          تاريخ الاستشهاد
        </label>
        <input
          type="date"
          name="death_date"
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/80">
          طريقة الاستشهاد
        </label>
        <select
          name="martyrdom_method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="combatant">مقاتل / Combatant</option>
          <option value="detained_then_martyred">معتقل ثم استشهد / Detained then Martyred</option>
          <option value="civilian_bombing">مدني - قصف / Civilian - Bombing</option>
          <option value="other">أخرى / Other</option>
        </select>
      </div>
      {method === "other" && (
        <div className="space-y-1 md:col-span-2 lg:col-span-3">
          <label className="text-xs font-medium text-foreground/80">
            تفاصيل طريقة الاستشهاد
          </label>
          <input
            name="martyrdom_details"
            required
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
      <div className="space-y-1 md:col-span-2 lg:col-span-3">
        <label className="text-xs font-medium text-foreground/80">
          الوسوم (Tags)
        </label>
        <input
          name="tags"
          placeholder="مفقود, تحت التعذيب"
          className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-1 md:col-span-2 lg:col-span-3">
        <label className="text-xs font-medium text-foreground/80">
          صورة الشهيد
        </label>
        <FileUpload
          accept="image/*"
          onUploadSuccess={(url) => { setImageUrl(url); setUploadError(""); }}
          onUploadingChange={setIsUploading}
          onUploadError={setUploadError}
          uploadLabel="اختر صورة / Choose photo"
          uploadingLabel="جارٍ الرفع..."
          folder="records"
          imageMaxWidth={800}
          imageWebpQuality={0.8}
          imageAspectRatio={3 / 4}
        />
        {uploadError && (
          <p className="mt-1 text-xs text-red-600">{uploadError}</p>
        )}
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="h-20 w-20 rounded-lg border border-primary/10 object-cover"
            />
          </div>
        )}
        <input type="hidden" name="image_url" value={imageUrl} />
      </div>

      <div className="flex items-center gap-4 md:col-span-2 lg:col-span-3">
        <button
          type="submit"
          disabled={submitting || isUploading}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "..." : tAdmin("buttons.addNew")}
        </button>
        {successMsg && (
          <span className="text-sm font-medium text-green-700">{successMsg}</span>
        )}
        {errorMsg && (
          <span className="text-sm font-medium text-red-600">{errorMsg}</span>
        )}
      </div>
    </form>
  );
}
