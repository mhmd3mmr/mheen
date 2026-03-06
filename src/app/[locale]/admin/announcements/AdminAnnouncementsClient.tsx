"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Trash2, Clock, AlertTriangle, HeartPulse, Share2 } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

type AnnouncementRow = {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  image_url: string | null;
  type: string;
  author_id: string;
  created_at: number;
};

type Props = {
  initialAnnouncements: AnnouncementRow[];
  role: string;
};

const TYPE_OPTIONS: { value: "urgent" | "general"; labelAr: string }[] = [
  { value: "urgent", labelAr: "عاجل" },
  { value: "general", labelAr: "عام" },
];

export default function AdminAnnouncementsClient({ initialAnnouncements, role }: Props) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [type, setType] = useState<"urgent" | "general">("general");
  const [contentAr, setContentAr] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const canPost = role === "admin" || role === "editor";

  const sortedAnnouncements = useMemo(
    () =>
      [...announcements].sort((a, b) => {
        return (b.created_at ?? 0) - (a.created_at ?? 0);
      }),
    [announcements]
  );

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canPost) {
      showToast("لا تملك صلاحية نشر إعلان جديد.", "error");
      return;
    }
    if (!titleAr.trim() || !contentAr.trim()) {
      showToast("العنوان والنص بالعربية مطلوبان.", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_ar: titleAr,
          title_en: titleEn || undefined,
          content_ar: contentAr,
          content_en: contentEn || undefined,
          image_url: imageUrl || undefined,
          type,
        }),
      });
      const data = (await res.json()) as { success?: boolean; id?: string; error?: string };
      if (!res.ok || !data.success) {
        showToast(data.error ?? "فشل إنشاء الإعلان", "error");
        return;
      }

      showToast("تم نشر الإعلان بنجاح", "success");
      setTitleAr("");
      setTitleEn("");
      setContentAr("");
      setContentEn("");
      setType("general");
      setImageUrl("");
      startTransition(() => router.refresh());
    } catch {
      showToast("حدث خطأ غير متوقع أثناء نشر الإعلان", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        showToast(data.error ?? "فشل حذف الإعلان", "error");
        return;
      }
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast("تم حذف الإعلان", "success");
      startTransition(() => router.refresh());
    } catch {
      showToast("حدث خطأ غير متوقع أثناء الحذف", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(timestamp: number | null | undefined) {
    if (!timestamp) return "";
    const d = new Date(timestamp * 1000);
    const day = d.getDate();
    const month = d.toLocaleDateString("ar-SY", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function typeBadge(type: string) {
    switch (type) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
            <AlertTriangle className="h-3 w-3" />
            عاجل
          </span>
        );
      case "obituary":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-100">
            <HeartPulse className="h-3 w-3" />
            نعوة / تأبين
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            عام
          </span>
        );
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="inline-flex items-center gap-2 font-qomra text-2xl font-semibold text-primary md:text-3xl">
            <Megaphone className="h-6 w-6" />
            نشرة البلدة / الإعلانات
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            نشر إعلانات عاجلة وأخبار عامة عن البلدة. الإعلانات تظهر في صفحة &quot;أخبار مهين&quot; مع زر مشاركة واتساب.
          </p>
        </div>
        {!canPost && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            يمكنك الاطلاع على الإعلانات فقط. صلاحية النشر متاحة للمشرفين والمحرّرين.
          </p>
        )}
      </header>

      {toast && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            toast.type === "success"
              ? "bg-green-500/10 text-green-700"
              : "bg-red-500/10 text-red-700"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {canPost && (
        <section className="rounded-2xl border border-primary/10 bg-background/70 p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-sm font-semibold text-primary">إضافة إعلان جديد</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  عنوان الإعلان (عربي) *
                </label>
                <input
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  Title (English)
                </label>
                <input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  نوع الإعلان
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.labelAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  نص الإعلان (عربي) *
                </label>
                <textarea
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  Announcement text (English)
                </label>
                <textarea
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/70">
                صورة مرافقة للإعلان (اختياري، مفضّل تناسب واتساب)
              </label>
              <FileUpload
                accept="image/*"
                folder="announcements"
                generateOgVariant
                imageMaxWidth={1280}
                imageWebpQuality={0.8}
                onUploadSuccess={(url) => {
                  setImageUrl(url);
                  setUploadError("");
                }}
                onUploadingChange={setIsUploading}
                onUploadError={setUploadError}
                uploadLabel="اختر صورة للإعلان"
                uploadingLabel="جارٍ رفع الصورة..."
              />
              {uploadError && (
                <p className="mt-1 text-xs text-red-600">
                  {uploadError}
                </p>
              )}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-lg border border-primary/10 object-cover"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={creating || isUploading || isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {creating ? "جارٍ النشر..." : "نشر الإعلان"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground/70">الإعلانات المنشورة</h2>
        {sortedAnnouncements.length === 0 ? (
          <p className="rounded-xl border border-dashed border-primary/20 bg-background/60 p-6 text-center text-sm text-foreground/60">
            لا توجد إعلانات حالياً.
          </p>
        ) : (
          <ul className="space-y-3">
            {sortedAnnouncements.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-3 rounded-xl border border-primary/10 bg-background/80 p-4 text-sm shadow-sm md:flex-row md:items-start md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {a.title_ar}
                    </h3>
                    {typeBadge(a.type)}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-foreground/60">
                    <Clock className="h-3.5 w-3.5" />
                    <span suppressHydrationWarning>{formatDate(a.created_at)}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/75">
                    {a.content_ar}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 md:flex-col md:items-end">
                  <a
                    href={`/pulse/${a.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-1.5 text-xs text-primary hover:bg-primary/5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    عرض / مشاركة
                  </a>
                  {canPost && (
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      disabled={deletingId === a.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === a.id ? "جاري الحذف..." : "حذف"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

