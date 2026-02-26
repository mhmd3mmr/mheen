"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Search,
  CheckCircle2,
  Trash2,
  Pencil,
  X,
  Images,
  Save,
  Mail,
  User,
} from "lucide-react";
import {
  type CommunityPhotoRow,
} from "@/app/actions/adminActions";

type Props = {
  initialPhotos: CommunityPhotoRow[];
};

export default function AdminCommunityPhotosClient({ initialPhotos }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [photos, setPhotos] = useState(initialPhotos);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleAr, setEditTitleAr] = useState("");
  const [editTitleEn, setEditTitleEn] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ msg, type });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  const filtered = photos.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.title_ar ?? "").toLowerCase().includes(q) ||
      (p.title_en ?? "").toLowerCase().includes(q) ||
      (p.submitted_by_name ?? "").toLowerCase().includes(q) ||
      (p.submitted_by_email ?? "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = photos.filter((p) => p.status === "pending").length;
  const approvedCount = photos.filter((p) => p.status === "approved").length;

  function startEdit(photo: CommunityPhotoRow) {
    setEditingId(photo.id);
    setEditTitleAr(photo.title_ar ?? photo.title);
    setEditTitleEn(photo.title_en ?? photo.title);
    setEditImageUrl(photo.image_url);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitleAr("");
    setEditTitleEn("");
    setEditImageUrl("");
  }

  async function handleSave(id: string) {
    setSaving(true);
    const res = await fetch("/api/community-photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title_ar: editTitleAr,
        title_en: editTitleEn,
        image_url: editImageUrl,
      }),
    });
    const result = (await res.json()) as { success?: boolean; error?: string };
    setSaving(false);
    if (res.ok && result.success) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                title: editTitleAr,
                title_ar: editTitleAr,
                title_en: editTitleEn,
                image_url: editImageUrl,
              }
            : p
        )
      );
      cancelEdit();
      showToast("تم تحديث الصورة بنجاح", "success");
      startTransition(() => router.refresh());
    } else {
      showToast(result.error ?? "فشل تحديث الصورة", "error");
    }
  }

  async function handleApprove(id: string) {
    const res = await fetch("/api/community-photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const result = (await res.json()) as { error?: string };
      showToast(result.error ?? "فشل اعتماد الصورة", "error");
      return;
    }
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
    );
    showToast("تم اعتماد الصورة", "success");
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    const res = await fetch("/api/community-photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const result = (await res.json()) as { error?: string };
      showToast(result.error ?? "فشل حذف الصورة", "error");
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showToast("تم حذف الصورة", "success");
    startTransition(() => router.refresh());
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {toast && (
        <div
          className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-success text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="font-qomra text-2xl font-semibold text-primary md:text-3xl">
          إدارة صور المجتمع والهوية
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          مراجعة واعتماد الصور المرسلة من الزوار وعرض المنشور منها.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            statusFilter === "all"
              ? "border-primary bg-primary/5"
              : "border-primary/10 bg-background/60"
          }`}
        >
          <Images className="h-5 w-5 text-primary" />
          <div className="text-start">
            <div className="text-xl font-bold text-primary">{photos.length}</div>
            <div className="text-xs text-foreground/60">الكل</div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            statusFilter === "pending"
              ? "border-amber-500 bg-amber-50"
              : "border-primary/10 bg-background/60"
          }`}
        >
          <Pencil className="h-5 w-5 text-amber-600" />
          <div className="text-start">
            <div className="text-xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-foreground/60">بانتظار المراجعة</div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            statusFilter === "approved"
              ? "border-success bg-success/5"
              : "border-primary/10 bg-background/60"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div className="text-start">
            <div className="text-xl font-bold text-success">{approvedCount}</div>
            <div className="text-xs text-foreground/60">معتمدة</div>
          </div>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="بحث بالعنوان، الاسم أو الإيميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-primary/10 bg-background/60 py-3 pe-4 ps-10 text-sm outline-none focus:border-primary/30"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((photo) => {
          const isEditing = editingId === photo.id;
          const displayTitle =
            locale === "ar"
              ? photo.title_ar || photo.title_en || photo.title
              : photo.title_en || photo.title_ar || photo.title;
          return (
            <article key={photo.id} className="rounded-2xl border border-primary/10 bg-background p-4 shadow-sm">
              <img
                src={isEditing ? editImageUrl || photo.image_url : photo.image_url}
                alt={photo.title}
                className="h-48 w-full rounded-xl border border-primary/10 object-cover"
              />

              <div className="mt-3 space-y-2">
                {isEditing ? (
                  <>
                    <input
                      value={editTitleAr}
                      onChange={(e) => setEditTitleAr(e.target.value)}
                      placeholder="العنوان بالعربية"
                      className="w-full rounded-lg border border-primary/20 px-3 py-2 text-sm"
                    />
                    <input
                      value={editTitleEn}
                      onChange={(e) => setEditTitleEn(e.target.value)}
                      placeholder="Title in English"
                      className="w-full rounded-lg border border-primary/20 px-3 py-2 text-sm"
                    />
                    <input
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="w-full rounded-lg border border-primary/20 px-3 py-2 text-sm"
                    />
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-primary/10 bg-primary/5 px-2.5 py-2">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          AR
                        </span>
                        <span className="text-[10px] text-foreground/55">Arabic title</span>
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-foreground">
                        {photo.title_ar || "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-primary/10 bg-primary/5 px-2.5 py-2">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          EN
                        </span>
                        <span className="text-[10px] text-foreground/55">English title</span>
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-foreground">
                        {photo.title_en || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                        {locale === "ar" ? "المعروض الآن" : "Shown now"}
                      </span>
                      <span className="text-foreground/70 line-clamp-1">{displayTitle}</span>
                    </div>
                  </div>
                )}

                <p className="flex items-center gap-1 text-xs text-foreground/60">
                  <User className="h-3.5 w-3.5" />
                  {photo.submitted_by_name || "—"}
                </p>
                <p className="flex items-center gap-1 text-xs text-foreground/60">
                  <Mail className="h-3.5 w-3.5" />
                  {photo.submitted_by_email || "—"}
                </p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    photo.status === "approved"
                      ? "bg-success/15 text-success"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {photo.status === "approved" ? "معتمدة" : "قيد المراجعة"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleSave(photo.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-background"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? "..." : "حفظ"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    {photo.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(photo.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        اعتماد
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(photo)}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
