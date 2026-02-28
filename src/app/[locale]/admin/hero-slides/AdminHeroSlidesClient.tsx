"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Trash2, Save, Plus } from "lucide-react";

type HeroSlide = {
  id: string;
  image_url: string;
  title_ar: string | null;
  title_en: string | null;
  is_active: number;
  sort_order: number;
};

export default function AdminHeroSlidesClient() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTitleAr, setNewTitleAr] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newSortOrder, setNewSortOrder] = useState(0);
  const [newActive, setNewActive] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string>("");

  async function loadSlides() {
    setLoading(true);
    const res = await fetch("/api/admin/hero-slides");
    const data = (await res.json()) as { slides?: HeroSlide[]; error?: string };
    if (res.ok) {
      setSlides(data.slides ?? []);
    } else {
      setToast(data.error ?? "Failed to load slides");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSlides();
  }, []);

  const sortedSlides = useMemo(
    () => [...slides].sort((a, b) => a.sort_order - b.sort_order),
    [slides]
  );

  async function addSlide() {
    if (!newImageUrl.trim()) {
      setToast("أضف صورة أولاً / Add image first");
      return;
    }
    const res = await fetch("/api/admin/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: newImageUrl.trim(),
        title_ar: newTitleAr.trim(),
        title_en: newTitleEn.trim(),
        sort_order: newSortOrder,
        is_active: newActive,
      }),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok || !data.success) {
      setToast(data.error ?? "Failed to add slide");
      return;
    }
    setNewImageUrl("");
    setNewTitleAr("");
    setNewTitleEn("");
    setNewSortOrder(0);
    setNewActive(true);
    setToast("تمت إضافة الصورة / Slide added");
    await loadSlides();
  }

  async function saveSlide(slide: HeroSlide) {
    setBusyId(slide.id);
    const res = await fetch("/api/admin/hero-slides", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: slide.id,
        image_url: slide.image_url,
        title_ar: slide.title_ar ?? "",
        title_en: slide.title_en ?? "",
        sort_order: slide.sort_order,
        is_active: slide.is_active === 1,
      }),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    setBusyId(null);
    if (!res.ok || !data.success) {
      setToast(data.error ?? "Failed to update slide");
      return;
    }
    setToast("تم الحفظ / Saved");
  }

  async function deleteSlide(id: string) {
    if (!confirm("حذف هذه الصورة؟ / Delete this slide?")) return;
    setBusyId(id);
    const res = await fetch("/api/admin/hero-slides", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    setBusyId(null);
    if (!res.ok || !data.success) {
      setToast(data.error ?? "Failed to delete slide");
      return;
    }
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setToast("تم الحذف / Deleted");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-qomra text-2xl font-semibold text-primary md:text-3xl">
          إدارة صور هيرو الصفحة الرئيسية
        </h1>
        <p className="mt-1 text-sm text-foreground/65">
          ارفع صورًا جديدة، وحدد ترتيبها، وفعّل أو عطّل أي صورة في السلايدر.
        </p>
      </div>

      {toast && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          {toast}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-primary/10 bg-background/60 p-4">
        <h2 className="text-sm font-semibold text-primary">إضافة صورة جديدة</h2>
        <p className="text-xs text-foreground/60">
          الرقم هو ترتيب الظهور في الهيرو (0 تظهر أولاً، ثم 1، ثم 2...)
        </p>
        <FileUpload
          accept="image/*"
          folder="hero"
          onUploadSuccess={(url) => setNewImageUrl(url)}
          onUploadingChange={setUploading}
          onUploadError={(msg) => setToast(msg)}
          uploadLabel="رفع صورة الهيرو"
          uploadingLabel="جارٍ الرفع..."
        />
        {newImageUrl && (
          <img
            src={newImageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-28 w-full rounded-lg object-cover sm:w-72"
          />
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={newTitleAr}
            onChange={(e) => setNewTitleAr(e.target.value)}
            placeholder="عنوان (اختياري) بالعربية"
            className="rounded-lg border border-primary/20 px-3 py-2 text-sm"
          />
          <input
            value={newTitleEn}
            onChange={(e) => setNewTitleEn(e.target.value)}
            placeholder="Optional title in English"
            className="rounded-lg border border-primary/20 px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={newSortOrder}
            onChange={(e) => setNewSortOrder(Number(e.target.value))}
            min={0}
            step={1}
            placeholder="ترتيب الظهور (0 أولاً)"
            className="rounded-lg border border-primary/20 px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
            />
            مفعّلة
          </label>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={addSlide}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          إضافة
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-foreground/60">Loading...</p>
        ) : sortedSlides.length === 0 ? (
          <p className="text-sm text-foreground/60">لا توجد صور بعد.</p>
        ) : (
          sortedSlides.map((slide, index) => (
            <div key={slide.id} className="rounded-xl border border-primary/10 bg-background p-4">
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <img
                  src={slide.image_url}
                  alt=""
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-32 w-full rounded-lg object-cover"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={slide.title_ar ?? ""}
                    onChange={(e) =>
                      setSlides((prev) =>
                        prev.map((s) => (s.id === slide.id ? { ...s, title_ar: e.target.value } : s))
                      )
                    }
                    placeholder="عنوان بالعربية"
                    className="rounded-lg border border-primary/20 px-3 py-2 text-sm"
                  />
                  <input
                    value={slide.title_en ?? ""}
                    onChange={(e) =>
                      setSlides((prev) =>
                        prev.map((s) => (s.id === slide.id ? { ...s, title_en: e.target.value } : s))
                      )
                    }
                    placeholder="Title in English"
                    className="rounded-lg border border-primary/20 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={slide.sort_order}
                    onChange={(e) =>
                      setSlides((prev) =>
                        prev.map((s) =>
                          s.id === slide.id ? { ...s, sort_order: Number(e.target.value) } : s
                        )
                      )
                    }
                    min={0}
                    step={1}
                    className="rounded-lg border border-primary/20 px-3 py-2 text-sm"
                  />
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={slide.is_active === 1}
                      onChange={(e) =>
                        setSlides((prev) =>
                          prev.map((s) =>
                            s.id === slide.id ? { ...s, is_active: e.target.checked ? 1 : 0 } : s
                          )
                        )
                      }
                    />
                    مفعّلة
                  </label>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveSlide(slide)}
                  disabled={busyId === slide.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => deleteSlide(slide.id)}
                  disabled={busyId === slide.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
