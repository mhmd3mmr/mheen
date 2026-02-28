"use client";

import { useEffect, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import { Trash2, Save, Plus } from "lucide-react";

type HeroSlide = {
  id: string;
  image_url: string | null;
  desktop_url: string | null;
  mobile_url: string | null;
  title_ar: string | null;
  title_en: string | null;
  is_active: number;
  sort_order: number;
};

export default function AdminHeroSlidesClient() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDesktopFile, setNewDesktopFile] = useState<File | null>(null);
  const [newMobileFile, setNewMobileFile] = useState<File | null>(null);
  const [newDesktopPreview, setNewDesktopPreview] = useState("");
  const [newMobilePreview, setNewMobilePreview] = useState("");
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

  async function processHeroImage(file: File) {
    const desktopBlob = await imageCompression(file, {
      maxWidthOrHeight: 1920,
      initialQuality: 0.8,
      maxSizeMB: 0.9,
      useWebWorker: true,
      fileType: "image/webp",
    });
    const mobileBlob = await imageCompression(file, {
      maxWidthOrHeight: 1200,
      initialQuality: 0.75,
      maxSizeMB: 0.29,
      useWebWorker: true,
      fileType: "image/webp",
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "hero";
    const desktopFile = new File([desktopBlob], `${baseName}-desktop.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
    const mobileFile = new File([mobileBlob], `${baseName}-mobile.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });

    const desktopSaved = file.size > 0 ? (((file.size - desktopFile.size) / file.size) * 100).toFixed(1) : "0.0";
    const mobileSaved = file.size > 0 ? (((file.size - mobileFile.size) / file.size) * 100).toFixed(1) : "0.0";
    const mobileOverTarget = mobileFile.size > 300 * 1024;
    console.log(
      `[hero] original ${(file.size / 1024).toFixed(1)}KB | desktop ${(desktopFile.size / 1024).toFixed(1)}KB (-${desktopSaved}%) | mobile ${(mobileFile.size / 1024).toFixed(1)}KB (-${mobileSaved}%)`
    );
    if (mobileOverTarget) {
      console.warn(
        `[hero] mobile image is ${(mobileFile.size / 1024).toFixed(1)}KB, above 300KB target`
      );
    }

    setNewDesktopFile(desktopFile);
    setNewMobileFile(mobileFile);
    setNewDesktopPreview(URL.createObjectURL(desktopFile));
    setNewMobilePreview(URL.createObjectURL(mobileFile));
  }

  async function addSlide() {
    if (!newDesktopFile || !newMobileFile) {
      setToast("أضف صورة أولاً / Add image first");
      return;
    }
    const formData = new FormData();
    formData.set("desktop_file", newDesktopFile);
    formData.set("mobile_file", newMobileFile);
    formData.set("title_ar", newTitleAr.trim());
    formData.set("title_en", newTitleEn.trim());
    formData.set("sort_order", String(newSortOrder));
    formData.set("is_active", String(newActive));

    const res = await fetch("/api/admin/hero-slides", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok || !data.success) {
      setToast(data.error ?? "Failed to add slide");
      return;
    }
    setNewDesktopFile(null);
    setNewMobileFile(null);
    setNewDesktopPreview("");
    setNewMobilePreview("");
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
        image_url: slide.desktop_url ?? slide.image_url ?? "",
        desktop_url: slide.desktop_url ?? slide.image_url ?? "",
        mobile_url: slide.mobile_url ?? slide.image_url ?? "",
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
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/25 bg-primary/5 py-10 hover:border-primary/40">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                await processHeroImage(file);
              } catch (err) {
                console.error(err);
                setToast("فشل معالجة الصورة / Image processing failed");
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
          <span className="text-sm text-primary">{uploading ? "جارٍ تجهيز النسخ..." : "رفع صورة الهيرو"}</span>
        </label>
        {(newDesktopPreview || newMobilePreview) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {newDesktopPreview && (
              <div>
                <p className="mb-1 text-xs text-foreground/60">Desktop preview (1920w)</p>
                <img src={newDesktopPreview} alt="" className="h-28 w-full rounded-lg object-cover" />
              </div>
            )}
            {newMobilePreview && (
              <div>
                <p className="mb-1 text-xs text-foreground/60">Mobile preview (1200w)</p>
                <img src={newMobilePreview} alt="" className="h-28 w-full rounded-lg object-cover" />
              </div>
            )}
          </div>
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
                  src={slide.desktop_url || slide.image_url || slide.mobile_url || ""}
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
