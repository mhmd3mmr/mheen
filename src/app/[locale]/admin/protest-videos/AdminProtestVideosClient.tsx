"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Pencil, X, Save, Plus, Video } from "lucide-react";

type VideoRow = {
  id: string;
  youtube_url: string;
  title_ar: string;
  title_en: string | null;
  date: string | null;
  created_at: number;
};

type Props = { initialVideos: VideoRow[] };

export default function AdminProtestVideosClient({ initialVideos }: Props) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formUrl, setFormUrl] = useState("");
  const [formTitleAr, setFormTitleAr] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formDate, setFormDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [, startTransition] = useTransition();
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ msg, type });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setFormUrl("");
    setFormTitleAr("");
    setFormTitleEn("");
    setFormDate("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(v: VideoRow) {
    setEditingId(v.id);
    setFormUrl(v.youtube_url);
    setFormTitleAr(v.title_ar);
    setFormTitleEn(v.title_en ?? "");
    setFormDate(v.date ?? "");
    setShowForm(true);
  }

  async function handleSubmit() {
    setSaving(true);
    const payload = {
      id: editingId ?? undefined,
      youtube_url: formUrl,
      title_ar: formTitleAr,
      title_en: formTitleEn || undefined,
      date: formDate || undefined,
    };
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch("/api/admin/protest-videos", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await res.json()) as { success?: boolean; error?: string; id?: string };
    setSaving(false);

    if (res.ok && result.success) {
      showToast(editingId ? "تم التحديث" : "تمت الإضافة", "success");
      resetForm();
      startTransition(() => router.refresh());
      const listRes = await fetch("/api/admin/protest-videos");
      const listData = (await listRes.json()) as { videos?: VideoRow[] };
      if (listData.videos) setVideos(listData.videos);
    } else {
      showToast(result.error ?? "حدث خطأ", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const res = await fetch("/api/admin/protest-videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      showToast("تم الحذف", "success");
      startTransition(() => router.refresh());
    } else {
      showToast("فشل الحذف", "error");
    }
  }

  const filtered = videos.filter((v) => {
    const q = searchQuery.toLowerCase();
    return !q || v.title_ar.toLowerCase().includes(q) || (v.title_en ?? "").toLowerCase().includes(q);
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
          <h1 className="font-qomra text-2xl font-semibold text-primary">إدارة فيديوهات الثورة</h1>
          <p className="mt-1 text-sm text-foreground/60">إضافة وتعديل فيديوهات صوت الساحات</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          إضافة فيديو
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-primary/15 bg-background p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            {editingId ? "تعديل الفيديو" : "إضافة فيديو جديد"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="رابط YouTube *"
              className="rounded-lg border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary/40"
            />
            <input
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              placeholder="التاريخ (مثال: 2011-04-15)"
              className="rounded-lg border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary/40"
            />
            <input
              value={formTitleAr}
              onChange={(e) => setFormTitleAr(e.target.value)}
              placeholder="العنوان بالعربية *"
              className="rounded-lg border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary/40"
            />
            <input
              value={formTitleEn}
              onChange={(e) => setFormTitleEn(e.target.value)}
              placeholder="Title in English"
              className="rounded-lg border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary/40"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background"
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
          placeholder="بحث بالعنوان..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-primary/10 bg-background/60 py-3 pe-4 ps-10 text-sm outline-none focus:border-primary/30"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/20 py-12 text-center text-sm text-foreground/50">
            <Video className="mx-auto mb-2 h-8 w-8 text-foreground/30" />
            لا توجد فيديوهات بعد
          </div>
        )}
        {filtered.map((v) => (
          <article
            key={v.id}
            className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-background p-4 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Video className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{v.title_ar}</p>
              {v.title_en && <p className="truncate text-sm text-foreground/60">{v.title_en}</p>}
              <p className="mt-0.5 text-xs text-foreground/40">{v.date ?? "—"}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => startEdit(v)}
                className="rounded-lg border border-primary/20 p-2 text-foreground/70 hover:bg-primary/5"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
