export const runtime = 'edge';

import { getTranslations } from "next-intl/server";
import { FadeUp } from "@/components/FadeUp";
import { getMartyrs } from "@/app/actions/adminActions";
import { AdminMartyrForm } from "./ui/AdminMartyrForm";

export default async function AdminMartyrsPage() {
  const tAdmin = await getTranslations("Admin");
  const rows = await getMartyrs();
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <FadeUp>
        <div>
          <h1 className="font-qomra text-2xl font-semibold text-primary md:text-3xl">
            {tAdmin("sidebar.martyrs")}
          </h1>
          <p className="mt-2 text-foreground/80">
            إدارة وتحديث سجل الشهداء في أرشيف مهين.
            {pendingCount > 0 && (
              <span className="ms-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                {pendingCount} بانتظار المراجعة
              </span>
            )}
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <AdminMartyrForm />
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-background/60">
          <table className="min-w-full text-sm">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">
                  {tAdmin("tables.name")}
                </th>
                <th className="px-4 py-3 text-start font-semibold">
                  {tAdmin("tables.date")}
                </th>
                <th className="px-4 py-3 text-start font-semibold">
                  {tAdmin("tables.status")}
                </th>
                <th className="px-4 py-3 text-start font-semibold">
                  {tAdmin("tables.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.id}
                  className={`border-t border-primary/10 hover:bg-primary/5 ${m.status === "pending" ? "bg-amber-50/50" : ""}`}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-3">
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-full border border-primary/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {m.name_ar.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground">
                          {m.name_ar}
                        </div>
                        <div className="text-xs text-foreground/60">
                          {m.name_en}
                        </div>
                        {m.submitted_by && (
                          <div className="text-xs text-foreground/40">
                            أرسله: {m.submitted_by}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-foreground/80">
                    {m.birth_date || "-"} / {m.death_date || "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {m.status === "pending" ? (
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
                      {m.status === "pending" && (
                        <form action="/api/admin/moderation" method="post">
                          <input type="hidden" name="entity" value="martyr" />
                          <input type="hidden" name="op" value="approve" />
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-success/90"
                          >
                            {tAdmin("buttons.approve")}
                          </button>
                        </form>
                      )}
                      <form action="/api/admin/moderation" method="post">
                        <input type="hidden" name="entity" value="martyr" />
                        <input type="hidden" name="op" value="delete" />
                        <input type="hidden" name="id" value={m.id} />
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
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-foreground/60"
                  >
                    لا توجد سجلات حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FadeUp>
    </div>
  );
}
