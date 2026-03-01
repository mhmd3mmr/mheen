export const runtime = "edge";

import { getDetainees, getMartyrs } from "@/app/actions/adminActions";
import { AdminRecordOfHonorClient, type UnifiedAdminRow } from "./AdminRecordOfHonorClient";

export default async function AdminRecordOfHonorPage() {
  const [martyrs, detainees] = await Promise.all([getMartyrs(), getDetainees()]);

  const rows: UnifiedAdminRow[] = [
    ...martyrs.map((m) => ({
      recordType: "martyr" as const,
      id: m.id,
      name_ar: m.name_ar,
      name_en: m.name_en,
      image_url: m.image_url,
      status: m.status,
      submitted_by: m.submitted_by,
      primary_date: m.death_date,
      secondary_date: m.birth_date,
      details: m.martyrdom_method
        ? `الطريقة: ${m.martyrdom_method}${m.martyrdom_method === "other" && m.martyrdom_details ? ` — ${m.martyrdom_details}` : ""}`
        : null,
      tags: m.tags,
    })),
    ...detainees.map((d) => ({
      recordType: "detainee" as const,
      id: d.id,
      name_ar: d.name_ar,
      name_en: d.name_en,
      image_url: d.image_url,
      status: d.status,
      submitted_by: d.submitted_by,
      primary_date: d.arrest_date,
      secondary_date: null,
      details: null,
      tags: d.tags,
    })),
  ].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return (b.primary_date ?? "").localeCompare(a.primary_date ?? "");
  });

  return <AdminRecordOfHonorClient initialRows={rows} />;
}
