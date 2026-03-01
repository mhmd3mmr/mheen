"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  CheckCircle,
  Trash2,
  Pencil,
  X,
  Clock,
  CircleCheck,
  Filter,
  BookOpen,
  CalendarDays,
  Save,
} from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

type StoryRow = {
  id: string;
  author_name: string;
  author_ar: string | null;
  author_en: string | null;
  title_ar: string | null;
  title_en: string | null;
  category: string | null;
  content: string;
  content_ar: string | null;
  content_en: string | null;
  tags: string | null;
  image_url: string | null;
  status: string;
  created_at: number;
};

type Props = {
  initialStories: StoryRow[];
};

export default function AdminStoriesClient({ initialStories }: Props) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [editingStory, setEditingStory] = useState<StoryRow | null>(null);
  const [editForm, setEditForm] = useState({
    title_ar: "",
    title_en: "",
    author_ar: "",
    author_en: "",
    content_ar: "",
    content_en: "",
    category: "other",
    tags: "",
  });
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ msg, type });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  const filtered = stories.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (s.author_ar || s.author_name || "").toLowerCase().includes(q) ||
      (s.author_en || "").toLowerCase().includes(q) ||
      (s.title_ar || "").toLowerCase().includes(q) ||
      (s.title_en || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = stories.filter((s) => s.status === "pending").length;
  const approvedCount = stories.filter((s) => s.status === "approved").length;

  const categoryLabels: Record<string, string> = useMemo(
    () => ({
      history: "التاريخ",
      memories: "الذكريات",
      figures: "الشخصيات",
      other: "متنوع",
    }),
    []
  );

  function normalizeImageSrc(url: string) {
    try {
      const parsed = new URL(url);
      if (
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
        parsed.pathname.startsWith("/api/upload")
      ) {
        return `${parsed.pathname}${parsed.search}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  function startEdit(s: StoryRow) {
    setEditingStory(s);
    setEditForm({
      title_ar: s.title_ar || "",
      title_en: s.title_en || "",
      author_ar: s.author_ar || s.author_name || "",
      author_en: s.author_en || "",
      content_ar: s.content_ar || s.content || "",
      content_en: s.content_en || "",
      category: s.category || "other",
      tags: s.tags || "",
    });
    setEditImageUrl("");
    setUploadError("");
  }

  function cancelEdit() {
    setEditingStory(null);
    setEditImageUrl("");
    setUploadError("");
  }

  async function handleSave() {
    if (!editingStory) return;
    setSaving(true);
    const response = await fetch("/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingStory.id,
        ...editForm,
        image_url: editImageUrl || undefined,
      }),
    });
    const res = (await response.json()) as { success?: boolean; error?: string };
    setSaving(false);
    if (response.ok && res.success) {
      setStories((prev) =>
        prev.map((s) =>
          s.id === editingStory.id
            ? {
                ...s,
                ...editForm,
                author_name: editForm.author_ar,
                content: editForm.content_ar,
                image_url: editImageUrl || s.image_url,
              }
            : s
        )
      );
      cancelEdit();
      showToast("تم تحديث القصة بنجاح", "success");
      startTransition(() => router.refresh());
    } else {
      showToast(res.error ?? "فشل تحديث القصة", "error");
    }
  }

  async function handleApprove(id: string) {
    const response = await fetch("/api/admin/stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const res = (await response.json()) as { error?: string };
      showToast(res.error ?? "فشل اعتماد القصة", "error");
      return;
    }
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s))
    );
    showToast("تم اعتماد القصة", "success");
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه القصة؟")) return;
    const response = await fetch("/api/admin/stories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const res = (await response.json()) as { error?: string };
      showToast(res.error ?? "فشل حذف القصة", "error");
      return;
    }
    setStories((prev) => prev.filter((s) => s.id !== id));
    showToast("تم حذف القصة", "success");
    startTransition(() => router.refresh());
  }

  function isImage(url: string | null) {
    if (!url) return false;
    return (
      url.startsWith("data:image") ||
      url.includes("/api/upload?key=") ||
      /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url)
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-success text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-qomra text-2xl font-semibold text-primary md:text-3xl">
          إدارة القصص والشهادات
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          مراجعة، تعديل، واعتماد القصص والشهادات المرسلة إلى الأرشيف
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
            statusFilter === "all"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-primary/10 bg-background/60 hover:border-primary/20"
          }`}
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <div className="text-start">
            <div className="text-xl font-bold text-primary">{stories.length}</div>
            <div className="text-xs text-foreground/60">الكل</div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
            statusFilter === "pending"
              ? "border-amber-500 bg-amber-50 shadow-sm"
              : "border-primary/10 bg-background/60 hover:border-amber-300"
          }`}
        >
          <Clock className="h-5 w-5 text-amber-600" />
          <div className="text-start">
            <div className="text-xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-foreground/60">بانتظار المراجعة</div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
            statusFilter === "approved"
              ? "border-success bg-success/5 shadow-sm"
              : "border-primary/10 bg-background/60 hover:border-success/30"
          }`}
        >
          <CircleCheck className="h-5 w-5 text-success" />
          <div className="text-start">
            <div className="text-xl font-bold text-success">{approvedCount}</div>
            <div className="text-xs text-foreground/60">معتمدة</div>
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="بحث بالاسم أو المحتوى..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-primary/10 bg-background/60 py-3 pe-4 ps-10 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
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

      {/* Results count */}
      <div className="flex items-center gap-2 text-xs text-foreground/50">
        <Filter className="h-3.5 w-3.5" />
        <span>
          عرض {filtered.length} من أصل {stories.length} قصة
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-primary/10 bg-background/60">
        <table className="min-w-full text-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">الصورة</th>
              <th className="px-4 py-3 text-start font-semibold">العنوان</th>
              <th className="px-4 py-3 text-start font-semibold">الكاتب / التاريخ</th>
              <th className="px-4 py-3 text-start font-semibold">الحالة</th>
              <th className="px-4 py-3 text-start font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className={`border-t border-primary/10 ${s.status === "pending" ? "bg-amber-50/40" : ""}`}
              >
                <td className="px-4 py-3 align-top">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border border-primary/10 bg-primary/5">
                    {s.image_url && isImage(s.image_url) ? (
                      <Image
                        src={normalizeImageSrc(s.image_url)}
                        alt=""
                        fill
                        sizes="48px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary/30">—</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="max-w-xs">
                    <p className="line-clamp-1 font-medium text-foreground">{s.title_ar || s.title_en || "—"}</p>
                    <p className="mt-1 text-xs text-foreground/55">{categoryLabels[s.category || "other"]}</p>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="text-foreground/80">{s.author_ar || s.author_name || "—"}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-foreground/55">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(s.created_at * 1000).toLocaleDateString("ar-SA")}
                  </p>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      s.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-success/10 text-success"
                    }`}
                  >
                    {s.status === "pending" ? <Clock className="h-3 w-3" /> : <CircleCheck className="h-3 w-3" />}
                    {s.status === "pending" ? "بانتظار المراجعة" : "معتمدة"}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/15 px-3 py-1.5 text-xs text-primary hover:bg-primary/5"
                    >
                      <Pencil className="h-3 w-3" />
                      تعديل
                    </button>
                    {s.status === "pending" && (
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs text-white hover:bg-success/90"
                      >
                        <CheckCircle className="h-3 w-3" />
                        اعتماد
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  {searchQuery || statusFilter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد قصص حالياً"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/60 p-3 backdrop-blur-sm md:p-6">
          <div className="mx-auto max-h-[95vh] max-w-4xl overflow-hidden rounded-2xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-primary/10 px-5 py-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <Pencil className="h-4 w-4" />
                تعديل القصة
              </h3>
              <button onClick={cancelEdit} className="rounded-lg p-1.5 text-foreground/50 hover:bg-primary/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(95vh-64px)] overflow-y-auto p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-primary/10 bg-primary/5">
                    {editingStory.image_url && isImage(editingStory.image_url) ? (
                      <Image
                        src={normalizeImageSrc(editImageUrl || editingStory.image_url)}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary/30">—</div>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-foreground/70">تغيير الصورة</label>
                    <FileUpload
                      accept="image/*"
                      onUploadSuccess={(url) => {
                        setEditImageUrl(url);
                        setUploadError("");
                      }}
                      onUploadingChange={setIsUploadingImage}
                      onUploadError={setUploadError}
                      uploadLabel="اختر صورة جديدة / Choose new photo"
                      uploadingLabel="جارٍ الرفع..."
                      folder="stories"
                      imageMaxWidth={800}
                      imageWebpQuality={0.8}
                      imageAspectRatio={3 / 4}
                    />
                    {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <InputField label="العنوان بالعربية" value={editForm.title_ar} onChange={(v) => setEditForm((p) => ({ ...p, title_ar: v }))} />
                  <InputField label="العنوان بالإنجليزية" value={editForm.title_en} onChange={(v) => setEditForm((p) => ({ ...p, title_en: v }))} />
                  <InputField label="الكاتب بالعربية" value={editForm.author_ar} onChange={(v) => setEditForm((p) => ({ ...p, author_ar: v }))} />
                  <InputField label="الكاتب بالإنجليزية" value={editForm.author_en} onChange={(v) => setEditForm((p) => ({ ...p, author_en: v }))} />
                  <SelectField
                    label="التصنيف"
                    value={editForm.category}
                    onChange={(v) => setEditForm((p) => ({ ...p, category: v }))}
                    options={[
                      { value: "history", label: "التاريخ" },
                      { value: "memories", label: "الذكريات" },
                      { value: "figures", label: "الشخصيات" },
                      { value: "other", label: "متنوع" },
                    ]}
                  />
                  <InputField label="الوسوم" value={editForm.tags} onChange={(v) => setEditForm((p) => ({ ...p, tags: v }))} />
                  <TextAreaField label="النص بالعربية" value={editForm.content_ar} onChange={(v) => setEditForm((p) => ({ ...p, content_ar: v }))} />
                  <TextAreaField label="النص بالإنجليزية" value={editForm.content_en} onChange={(v) => setEditForm((p) => ({ ...p, content_en: v }))} />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-primary/10 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || isUploadingImage}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded-lg border border-primary/15 px-4 py-2 text-xs text-foreground/70 hover:bg-primary/5"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/70">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/70">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
