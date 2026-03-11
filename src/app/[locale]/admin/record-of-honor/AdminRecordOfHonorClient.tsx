"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import type { DetaineeRow, MartyrRow } from "@/app/actions/adminActions";

type RecordType = "martyr" | "detainee";
type FilterType = "all" | RecordType;
type MartyrdomMethod = "combatant" | "detained_then_martyred" | "civilian_bombing" | "other";

export type UnifiedAdminRow = {
  recordType: RecordType;
  id: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  status: string;
  submitted_by: string | null;
  primary_date: string | null;
  secondary_date: string | null;
  details: string | null;
  tags: string | null;
};

type EditingRecord = { type: "martyr"; data: MartyrRow } | { type: "detainee"; data: DetaineeRow };

type EditFormMartyr = {
  name_ar: string;
  name_en: string;
  birth_date: string;
  death_date: string;
  martyrdom_method: MartyrdomMethod;
  martyrdom_details: string;
  tags: string;
};

type EditFormDetainee = {
  name_ar: string;
  name_en: string;
  arrest_date: string;
  status_ar: string;
  status_en: string;
  tags: string;
};

export function AdminRecordOfHonorClient({
  initialRows,
  fullMartyrs = [],
  fullDetainees = [],
}: {
  initialRows: UnifiedAdminRow[];
  fullMartyrs?: MartyrRow[];
  fullDetainees?: DetaineeRow[];
}) {
  const tAdmin = useTranslations("Admin");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [recordType, setRecordType] = useState<RecordType>("martyr");
  const [martyrdomMethod, setMartyrdomMethod] = useState<MartyrdomMethod>("combatant");
  const [imageUrl, setImageUrl] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingRecord, setEditingRecord] = useState<EditingRecord | null>(null);
  const [editFormMartyr, setEditFormMartyr] = useState<EditFormMartyr | null>(null);
  const [editFormDetainee, setEditFormDetainee] = useState<EditFormDetainee | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPreviewImageUrl, setEditPreviewImageUrl] = useState("");
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const [editUploadError, setEditUploadError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editToast, setEditToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const pendingCount = initialRows.filter((r) => r.status === "pending").length;
  const totals = useMemo(
    () => ({
      all: initialRows.length,
      martyr: initialRows.filter((r) => r.recordType === "martyr").length,
      detainee: initialRows.filter((r) => r.recordType === "detainee").length,
    }),
    [initialRows]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialRows.filter((row) => {
      const passType = activeFilter === "all" ? true : row.recordType === activeFilter;
      const passSearch =
        !q || row.name_ar.toLowerCase().includes(q) || row.name_en.toLowerCase().includes(q);
      return passType && passSearch;
    });
  }, [activeFilter, initialRows, searchQuery]);

  function startEdit(row: UnifiedAdminRow) {
    if (row.recordType === "martyr") {
      const m = fullMartyrs.find((x) => x.id === row.id);
      if (m) {
        setEditingRecord({ type: "martyr", data: m });
        setEditFormMartyr({
          name_ar: m.name_ar,
          name_en: m.name_en,
          birth_date: m.birth_date ?? "",
          death_date: m.death_date ?? "",
          martyrdom_method: (m.martyrdom_method as MartyrdomMethod) ?? "combatant",
          martyrdom_details: m.martyrdom_details ?? "",
          tags: m.tags ?? "",
        });
        setEditFormDetainee(null);
      }
    } else {
      const d = fullDetainees.find((x) => x.id === row.id);
      if (d) {
        setEditingRecord({ type: "detainee", data: d });
        setEditFormDetainee({
          name_ar: d.name_ar,
          name_en: d.name_en,
          arrest_date: d.arrest_date ?? "",
          status_ar: d.status_ar ?? "",
          status_en: d.status_en ?? "",
          tags: d.tags ?? "",
        });
        setEditFormMartyr(null);
      }
    }
    setEditImageUrl("");
    setEditUploadError("");
  }

  function cancelEdit() {
    setEditingRecord(null);
    setEditFormMartyr(null);
    setEditFormDetainee(null);
    setEditImageUrl("");
    setEditPreviewImageUrl("");
    setEditUploadError("");
  }

  function showEditToast(msg: string, type: "success" | "error") {
    setEditToast({ msg, type });
    setTimeout(() => setEditToast(null), 3000);
  }

  async function handleSaveEdit() {
    if (!editingRecord) return;
    setSavingEdit(true);
    try {
      if (editingRecord.type === "martyr" && editFormMartyr) {
        const payload = {
          id: editingRecord.data.id,
          ...editFormMartyr,
          image_url: editImageUrl || editingRecord.data.image_url || null,
          preview_image_url: editPreviewImageUrl || null,
        };
        const res = await fetch("/api/admin/martyrs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = (await res.json()) as { success?: boolean; error?: string };
        if (res.ok && result.success) {
          cancelEdit();
          showEditToast("تم تحديث بيانات الشهيد بنجاح", "success");
          router.refresh();
        } else {
          showEditToast(result.error ?? "فشل التحديث", "error");
        }
      } else if (editingRecord.type === "detainee" && editFormDetainee) {
        const payload = {
          id: editingRecord.data.id,
          ...editFormDetainee,
          image_url: editImageUrl || editingRecord.data.image_url || null,
          preview_image_url: editPreviewImageUrl || null,
        };
        const res = await fetch("/api/admin/detainees", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = (await res.json()) as { success?: boolean; error?: string };
        if (res.ok && result.success) {
          cancelEdit();
          showEditToast("تم تحديث بيانات المعتقل بنجاح", "success");
          router.refresh();
        } else {
          showEditToast(result.error ?? "فشل التحديث", "error");
        }
      }
    } catch {
      showEditToast("حدث خطأ غير متوقع", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData(e.currentTarget);
      if (imageUrl) formData.set("image_url", imageUrl);
      if (previewImageUrl) formData.set("preview_image_url", previewImageUrl);
      formData.set("desired_status", "approved");

      if (recordType === "martyr") {
        formData.set("martyrdom_method", martyrdomMethod);
      } else {
        formData.delete("martyrdom_method");
        formData.delete("martyrdom_details");
      }

      const endpoint = recordType === "martyr" ? "/api/martyrs" : "/api/detainees";
      const response = await fetch(endpoint, { method: "POST", body: formData });
      const result = (await response.json()) as { success?: boolean; error?: string };

      if (response.ok && result.success) {
        setSuccessMsg("تمت الإضافة بنجاح / Added successfully");
        formRef.current?.reset();
        setImageUrl("");
        setPreviewImageUrl("");
        setMartyrdomMethod("combatant");
        setRecordType("martyr");
        router.refresh();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setErrorMsg(result.error ?? "Failed to add record");
      }
    } catch {
      setErrorMsg("حدث خطأ غير متوقع / Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-qomra text-2xl font-semibold text-primary md:text-3xl">
          {tAdmin("sidebar.honorRecords")}
        </h1>
        <p className="mt-2 text-foreground/80">
          إدارة سجل الشهداء والمعتقلين ضمن جدول موحّد.
          {pendingCount > 0 && (
            <span className="ms-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              {pendingCount} بانتظار المراجعة
            </span>
          )}
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-primary/10 bg-background/60 p-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground/80">نوع السجل</label>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as RecordType)}
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="martyr">شهيد</option>
            <option value="detainee">معتقل</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground/80">الاسم (عربي)</label>
          <input
            name="name_ar"
            required
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground/80">Name (English)</label>
          <input
            name="name_en"
            required
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {recordType === "martyr" ? (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/80">تاريخ الميلاد</label>
              <input
                type="date"
                name="birth_date"
                className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/80">تاريخ الاستشهاد</label>
              <input
                type="date"
                name="death_date"
                className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/80">طريقة الاستشهاد</label>
              <select
                name="martyrdom_method"
                value={martyrdomMethod}
                onChange={(e) => setMartyrdomMethod(e.target.value as MartyrdomMethod)}
                className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="combatant">Combatant / مقاتل</option>
                <option value="detained_then_martyred">Detained then Martyred / معتقل ثم استشهد</option>
                <option value="civilian_bombing">Civilian - Bombing / مدني - قصف</option>
                <option value="other">Other method / طريقة غير</option>
              </select>
            </div>
            {martyrdomMethod === "other" && (
              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-medium text-foreground/80">تفاصيل طريقة الاستشهاد</label>
                <input
                  name="martyrdom_details"
                  required
                  className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/80">تاريخ الاعتقال</label>
            <input
              type="date"
              name="arrest_date"
              className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div className="space-y-1 md:col-span-2 lg:col-span-3">
          <label className="text-xs font-medium text-foreground/80">الوسوم (Tags)</label>
          <input
            name="tags"
            placeholder="مفقود, تحت التعذيب"
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1 md:col-span-2 lg:col-span-3">
          <label className="text-xs font-medium text-foreground/80">
            {recordType === "martyr" ? "صورة الشهيد" : "صورة المعتقل"}
          </label>
          <FileUpload
            accept="image/*"
            onUploadSuccess={(url) => {
              setImageUrl(url);
              setUploadError("");
            }}
            onUploadSuccessDetailed={(r) => {
              if (r.previewUrl) setPreviewImageUrl(r.previewUrl);
            }}
            onUploadingChange={setIsUploading}
            onUploadError={setUploadError}
            uploadLabel="اختر صورة / Choose photo"
            uploadingLabel="جارٍ الرفع..."
            folder="records"
            generateOgVariant
            generatePreviewVariant
            imageMaxWidth={800}
            imageWebpQuality={0.8}
            imageAspectRatio={3 / 4}
          />
          {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
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
          <input type="hidden" name="preview_image_url" value={previewImageUrl} />
        </div>

        <div className="flex items-center gap-4 md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={submitting || isUploading}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "..." : tAdmin("buttons.addNew")}
          </button>
          {successMsg && <span className="text-sm font-medium text-green-700">{successMsg}</span>}
          {errorMsg && <span className="text-sm font-medium text-red-600">{errorMsg}</span>}
        </div>
      </form>

      <div className="rounded-xl border border-primary/10 bg-background/60 p-3">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <FilterButton
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
              label={`الكل (${totals.all})`}
            />
            <FilterButton
              active={activeFilter === "martyr"}
              onClick={() => setActiveFilter("martyr")}
              label={`الشهداء (${totals.martyr})`}
            />
            <FilterButton
              active={activeFilter === "detainee"}
              onClick={() => setActiveFilter("detainee")}
              label={`المعتقلون (${totals.detainee})`}
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم..."
            className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{tAdmin("tables.name")}</th>
                <th className="px-4 py-3 text-start font-semibold">النوع</th>
                <th className="px-4 py-3 text-start font-semibold">{tAdmin("tables.date")}</th>
                <th className="px-4 py-3 text-start font-semibold">{tAdmin("tables.status")}</th>
                <th className="px-4 py-3 text-start font-semibold">{tAdmin("tables.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={`${row.recordType}-${row.id}`}
                  className={`border-t border-primary/10 hover:bg-primary/5 ${row.status === "pending" ? "bg-amber-50/50" : ""}`}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-3">
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-full border border-primary/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {row.name_ar.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground">{row.name_ar}</div>
                        <div className="text-xs text-foreground/60">{row.name_en}</div>
                        {row.details && <div className="text-xs text-foreground/50">{row.details}</div>}
                        {row.tags && <div className="text-xs text-foreground/50">الوسوم: {row.tags}</div>}
                        {row.submitted_by && (
                          <div className="text-xs text-foreground/40">أرسله: {row.submitted_by}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.recordType === "martyr"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.recordType === "martyr" ? "شهيد" : "معتقل"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-foreground/80">
                    {row.secondary_date ? `${row.secondary_date} / ${row.primary_date || "-"}` : row.primary_date || "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {row.status === "pending" ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        بانتظار المراجعة
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        معتمد
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                      >
                        <Pencil className="h-3 w-3" />
                        تعديل
                      </button>
                      {row.status === "pending" && (
                        <form action="/api/admin/moderation" method="post">
                          <input type="hidden" name="entity" value={row.recordType} />
                          <input type="hidden" name="op" value="approve" />
                          <input type="hidden" name="id" value={row.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-success/90"
                          >
                            {tAdmin("buttons.approve")}
                          </button>
                        </form>
                      )}
                      <form action="/api/admin/moderation" method="post">
                        <input type="hidden" name="entity" value={row.recordType} />
                        <input type="hidden" name="op" value="delete" />
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-red-700"
                        >
                          {tAdmin("buttons.delete")}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-foreground/60">
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (editFormMartyr || editFormDetainee) && (
        <div className="fixed inset-0 z-50 bg-black/60 p-3 backdrop-blur-sm md:p-6">
          <div className="mx-auto max-h-[95vh] max-w-4xl overflow-hidden rounded-2xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-primary/10 px-5 py-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <Pencil className="h-4 w-4" />
                {editingRecord.type === "martyr" ? "تعديل بيانات الشهيد" : "تعديل بيانات المعتقل"}
              </h3>
              <button onClick={cancelEdit} className="rounded-lg p-1.5 text-foreground/50 hover:bg-primary/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(95vh-64px)] overflow-y-auto p-5">
              {editToast && (
                <div
                  className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                    editToast.type === "success" ? "bg-success/10 text-success" : "bg-red-100 text-red-700"
                  }`}
                >
                  {editToast.msg}
                </div>
              )}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-primary/10 bg-primary/5">
                    {(editImageUrl || editingRecord.data.image_url) ? (
                      <img
                        src={editImageUrl || editingRecord.data.image_url || ""}
                        alt=""
                        className="h-full w-full object-cover"
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
                        setEditUploadError("");
                      }}
                      onUploadSuccessDetailed={(r) => {
                        if (r.previewUrl) setEditPreviewImageUrl(r.previewUrl);
                      }}
                      onUploadingChange={setIsUploadingEdit}
                      onUploadError={setEditUploadError}
                      uploadLabel="اختر صورة جديدة / Choose new photo"
                      uploadingLabel="جارٍ الرفع..."
                      folder="records"
                      generateOgVariant
                      generatePreviewVariant
                      imageMaxWidth={800}
                      imageWebpQuality={0.8}
                      imageAspectRatio={3 / 4}
                    />
                    {editUploadError && <p className="mt-2 text-xs text-red-600">{editUploadError}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  {editFormMartyr && (
                    <>
                      <EditInput label="الاسم (عربي)" value={editFormMartyr.name_ar} onChange={(v) => setEditFormMartyr((p) => (p ? { ...p, name_ar: v } : p))} />
                      <EditInput label="Name (English)" value={editFormMartyr.name_en} onChange={(v) => setEditFormMartyr((p) => (p ? { ...p, name_en: v } : p))} />
                      <EditInput label="تاريخ الميلاد" type="date" value={editFormMartyr.birth_date} onChange={(v) => setEditFormMartyr((p) => (p ? { ...p, birth_date: v } : p))} />
                      <EditInput label="تاريخ الاستشهاد" type="date" value={editFormMartyr.death_date} onChange={(v) => setEditFormMartyr((p) => (p ? { ...p, death_date: v } : p))} />
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground/70">طريقة الاستشهاد</label>
                        <select
                          value={editFormMartyr.martyrdom_method}
                          onChange={(e) =>
                            setEditFormMartyr((p) =>
                              p ? { ...p, martyrdom_method: e.target.value as MartyrdomMethod } : p
                            )
                          }
                          className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="combatant">مقاتل / Combatant</option>
                          <option value="detained_then_martyred">معتقل ثم استشهد / Detained then Martyred</option>
                          <option value="civilian_bombing">مدني - قصف / Civilian - Bombing</option>
                          <option value="other">طريقة غير / Other method</option>
                        </select>
                      </div>
                      {editFormMartyr.martyrdom_method === "other" && (
                        <EditInput
                          label="تفاصيل طريقة الاستشهاد"
                          value={editFormMartyr.martyrdom_details}
                          onChange={(v) => setEditFormMartyr((p) => (p ? { ...p, martyrdom_details: v } : p))}
                        />
                      )}
                      <EditInput label="الوسوم" value={editFormMartyr.tags} onChange={(v) => setEditFormMartyr((p) => (p ? { ...p, tags: v } : p))} />
                    </>
                  )}
                  {editFormDetainee && (
                    <>
                      <EditInput label="الاسم (عربي)" value={editFormDetainee.name_ar} onChange={(v) => setEditFormDetainee((p) => (p ? { ...p, name_ar: v } : p))} />
                      <EditInput label="Name (English)" value={editFormDetainee.name_en} onChange={(v) => setEditFormDetainee((p) => (p ? { ...p, name_en: v } : p))} />
                      <EditInput label="تاريخ الاعتقال" type="date" value={editFormDetainee.arrest_date} onChange={(v) => setEditFormDetainee((p) => (p ? { ...p, arrest_date: v } : p))} />
                      <EditInput label="حالة المعتقل (عربي)" value={editFormDetainee.status_ar} onChange={(v) => setEditFormDetainee((p) => (p ? { ...p, status_ar: v } : p))} />
                      <EditInput label="Detainee status (English)" value={editFormDetainee.status_en} onChange={(v) => setEditFormDetainee((p) => (p ? { ...p, status_en: v } : p))} />
                      <EditInput label="الوسوم" value={editFormDetainee.tags} onChange={(v) => setEditFormDetainee((p) => (p ? { ...p, tags: v } : p))} />
                    </>
                  )}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-primary/10 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || isUploadingEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingEdit ? "جاري الحفظ..." : "حفظ التعديلات"}
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

function EditInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-primary/15 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
      />
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        active ? "border-primary bg-primary text-white" : "border-primary/20 text-foreground/75 hover:bg-primary/5"
      }`}
    >
      {label}
    </button>
  );
}
