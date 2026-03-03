"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Pencil, X, Save, Plus, ImageIcon, GripVertical } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

type BannerRow = {
  id: string;
  image_url: string;
  description_ar: string;
  description_en: string | null;
  date: string | null;
  sort_order?: number;
  created_at: number;
};

type Props = { initialBanners: BannerRow[] };

export default function AdminProtestBannersClient({ initialBanners }: Props) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formImageUrl, setFormImageUrl] = useState("");
  const [formDescAr, setFormDescAr] = useState("");
  const [formDescEn, setFormDescEn] = useState("");
  const [formDate, setFormDate] = useState("");
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [, startTransition] = useTransition();
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ msg, type });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setFormImageUrl("");
    setFormDescAr("");
    setFormDescEn("");
    setFormDate("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(b: BannerRow) {
    setEditingId(b.id);
    setFormImageUrl(b.image_url);
    setFormDescAr(b.description_ar);
    setFormDescEn(b.description_en ?? "");
    setFormDate(b.date ?? "");
    setShowForm(true);
  }

  function moveById(list: BannerRow[], fromId: string, toId: string) {
    const fromIndex = list.findIndex((item) => item.id === fromId);
    const toIndex = list.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return list;
    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }

  async function persistOrder(nextList: BannerRow[]) {
    setSavingOrder(true);
    try {
      const res = await fetch("/api/admin/protest-banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordered_ids: nextList.map((item) => item.id) }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        showToast(data.error ?? "فشل حفظ الترتيب", "error");
        return;
      }
      showToast("تم حفظ الترتيب", "success");
      startTransition(() => router.refresh());
    } catch {
      showToast("فشل حفظ الترتيب", "error");
    } finally {
      setSavingOrder(false);
    }
  }

  async function handleSubmit() {
    if (!formImageUrl) { showToast("يرجى رفع صورة أولاً", "error"); return; }
    setSaving(true);
    const payload = {
      id: editingId ?? undefined,
      image_url: formImageUrl,
      description_ar: formDescAr,
      description_en: formDescEn || undefined,
      date: formDate || undefined,
    };
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch("/api/admin/protest-banners", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await res.json()) as { success?: boolean; error?: string };
    setSaving(false);

    if (res.ok && result.success) {
      showToast(editingId ? "تم التحديث" : "تمت الإضافة", "success");
      resetForm();
      startTransition(() => router.refresh());
      const listRes = await fetch("/api/admin/protest-banners");
      const listData = (await listRes.json()) as { banners?: BannerRow[] };
      if (listData.banners) setBanners(listData.banners);
    } else {
      showToast(result.error ?? "حدث خطأ", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const res = await fetch("/api/admin/protest-banners", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      showToast("تم الحذف", "success");
      startTransition(() => router.refresh());
    } else {
      showToast("فشل الحذف", "error");
    }
  }

  const filtered = banners.filter((b) => {
    const q = searchQuery.toLowerCase();
    return !q || b.description_ar.toLowerCase().includes(q) || (b.description_en ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {toast && (
        <div
          className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-success text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-qomra text-2xl font-semibold text-primary">إدارة لافتات الثورة</h1>
          <p className="mt-1 text-sm text-foreground/60">إضافة وتعديل صور اللافتات من المظاهرات</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          إضافة لافتة
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-primary/15 bg-background p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            {editingId ? "تعديل اللافتة" : "إضافة لافتة جديدة"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FileUpload
                accept="image/*"
                folder="banners"
                onUploadSuccess={(url) => setFormImageUrl(url)}
                onUploadingChange={setUploading}
                uploadLabel="ارفع صورة اللافتة *"
                uploadingLabel="جارٍ الرفع..."
                imageMaxWidth={1920}
                imageWebpQuality={0.85}
              />
              {formImageUrl && (
                <img
                  src={formImageUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-auto rounded-lg border object-contain"
                />
              )}
            </div>
            <input
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              placeholder="التاريخ (مثال: 2011-04-15)"
              className="rounded-lg border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary/40"
            />
            <div />
            <textarea
              value={formDescAr}
              onChange={(e) => setFormDescAr(e.target.value)}
              placeholder="الوصف بالعربية *"
              rows={3}
              className="rounded-lg border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary/40"
            />
            <textarea
              value={formDescEn}
              onChange={(e) => setFormDescEn(e.target.value)}
              placeholder="Description in English"
              rows={3}
              className="rounded-lg border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary/40"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "..." : "حفظ"}
            </button>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-4 py-2 text-sm"
            >
              <X className="h-4 w-4" />
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="بحث بالوصف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-primary/10 bg-background/60 py-3 pe-4 ps-10 text-sm outline-none focus:border-primary/30"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {searchQuery && (
          <div className="col-span-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            لإعادة الترتيب بالسحب والإفلات، امسح البحث أولاً.
          </div>
        )}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-primary/20 py-12 text-center text-sm text-foreground/50">
            <ImageIcon className="mx-auto mb-2 h-8 w-8 text-foreground/30" />
            لا توجد لافتات بعد
          </div>
        )}
        {filtered.map((b) => (
          <article
            key={b.id}
            className="rounded-2xl border border-primary/10 bg-background p-4 shadow-sm"
            draggable={!searchQuery && !savingOrder}
            onDragStart={() => setDraggingId(b.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(e) => {
              if (!searchQuery) e.preventDefault();
            }}
            onDrop={() => {
              if (!draggingId || searchQuery || draggingId === b.id) return;
              const next = moveById(banners, draggingId, b.id);
              setBanners(next);
              setDraggingId(null);
              void persistOrder(next);
            }}
          >
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                disabled={!!searchQuery || savingOrder}
                className="cursor-grab rounded-lg border border-primary/15 p-2 text-foreground/50 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
                title="اسحب لإعادة الترتيب"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
            <img
              src={b.image_url}
              alt={b.description_ar}
              className="h-48 w-full rounded-xl border border-primary/10 object-cover"
            />
            <div className="mt-3 space-y-1">
              <p className="line-clamp-2 text-sm font-medium text-foreground">{b.description_ar}</p>
              {b.description_en && (
                <p className="line-clamp-2 text-xs text-foreground/60">{b.description_en}</p>
              )}
              <p className="text-xs text-foreground/40">{b.date ?? "—"}</p>
            </div>
            <div className="mt-3 flex gap-1.5">
              <button
                onClick={() => startEdit(b)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" />
                تعديل
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
