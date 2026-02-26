"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  User,
  Calendar,
  Save,
} from "lucide-react";

type StoryRow = {
  id: string;
  author_name: string;
  content: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editContent, setEditContent] = useState("");
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
      s.author_name.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = stories.filter((s) => s.status === "pending").length;
  const approvedCount = stories.filter((s) => s.status === "approved").length;

  function startEdit(s: StoryRow) {
    setEditingId(s.id);
    setEditAuthor(s.author_name);
    setEditContent(s.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditAuthor("");
    setEditContent("");
  }

  async function handleSave(id: string) {
    setSaving(true);
    const response = await fetch("/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        author_name: editAuthor,
        content: editContent,
      }),
    });
    const res = (await response.json()) as { success?: boolean; error?: string };
    setSaving(false);
    if (response.ok && res.success) {
      setStories((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, author_name: editAuthor, content: editContent } : s
        )
      );
      cancelEdit();
      showToast("تم تحديث القصة بنجاح", "success");
      startTransition(() => router.refresh());
    } else {
      showToast(res.error, "error");
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

      {/* Stories List */}
      <div className="space-y-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className={`overflow-hidden rounded-xl border shadow-sm transition-all ${
              s.status === "pending"
                ? "border-amber-200 bg-amber-50/30"
                : "border-primary/10 bg-background/60"
            }`}
          >
            {editingId === s.id ? (
              /* ── Edit Mode ── */
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    تعديل القصة
                  </h3>
                  <button
                    onClick={cancelEdit}
                    className="rounded-lg p-1.5 text-foreground/50 hover:bg-primary/5 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground/70">
                    اسم الكاتب
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground/70">
                    المحتوى
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSave(s.id)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded-lg border border-primary/15 px-4 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-primary/5"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              /* ── View Mode ── */
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                {s.image_url && isImage(s.image_url) && (
                  <div className="shrink-0 sm:w-32">
                    <img
                      src={s.image_url}
                      alt=""
                      className="h-32 w-full object-cover sm:h-full sm:rounded-s-xl"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-primary">
                          {s.author_name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-foreground/50">
                          <Calendar className="h-3 w-3" />
                          {new Date(s.created_at * 1000).toLocaleDateString("ar-SA")}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        s.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {s.status === "pending" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <CircleCheck className="h-3 w-3" />
                      )}
                      {s.status === "pending" ? "بانتظار المراجعة" : "معتمدة"}
                    </span>
                  </div>

                  <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                    {s.content}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-primary/5 pt-3">
                    <button
                      onClick={() => startEdit(s)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                    >
                      <Pencil className="h-3 w-3" />
                      تعديل
                    </button>
                    {s.status === "pending" && (
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-success/90"
                      >
                        <CheckCircle className="h-3 w-3" />
                        اعتماد
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-primary/10 bg-background/60 p-10 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-foreground/20" />
            <p className="text-sm text-foreground/50">
              {searchQuery || statusFilter !== "all"
                ? "لا توجد نتائج مطابقة"
                : "لا توجد قصص حالياً"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
