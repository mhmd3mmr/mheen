"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/FileUpload";

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

export function AdminRecordOfHonorClient({ initialRows }: { initialRows: UnifiedAdminRow[] }) {
  const tAdmin = useTranslations("Admin");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [recordType, setRecordType] = useState<RecordType>("martyr");
  const [martyrdomMethod, setMartyrdomMethod] = useState<MartyrdomMethod>("combatant");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData(e.currentTarget);
      if (imageUrl) formData.set("image_url", imageUrl);
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
                <option value="other">Other / أخرى</option>
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
            onUploadingChange={setIsUploading}
            onUploadError={setUploadError}
            uploadLabel="اختر صورة / Choose photo"
            uploadingLabel="جارٍ الرفع..."
            folder="records"
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
                    <div className="flex items-center gap-2">
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
