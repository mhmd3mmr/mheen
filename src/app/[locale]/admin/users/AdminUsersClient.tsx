"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Search, UserCog, Save } from "lucide-react";
import { updateUserRole } from "@/app/actions/adminActions";
import type { UserRow } from "@/app/actions/adminActions";

type Props = {
  initialUsers: UserRow[];
};

const ROLES = ["admin", "contributor", "public"] as const;

export default function AdminUsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = useTranslations("Admin.users");
  const tTables = useTranslations("Admin.tables");

  function showToast(msg: string, type: "success" | "error") {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ msg, type });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const name = (u.name ?? "").toLowerCase();
    const email = (u.email ?? "").toLowerCase();
    return !q || name.includes(q) || email.includes(q);
  });

  function getRoleLabel(role: string) {
    switch (role) {
      case "admin":
        return t("roleAdmin");
      case "contributor":
        return t("roleContributor");
      default:
        return t("rolePublic");
    }
  }

  function handleRoleChange(userId: string, newRole: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  }

  function handleSave(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setSavingId(userId);
    const formData = new FormData();
    formData.set("id", userId);
    formData.set("role", user.role);

    startTransition(async () => {
      const result = await updateUserRole(formData);
      setSavingId(null);
      if (result.success) {
        showToast(t("roleUpdated"), "success");
      } else {
        showToast(result.error, "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-qomra text-2xl font-semibold text-primary">
          {t("title")}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-primary/20 bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
          />
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            toast.type === "success"
              ? "bg-green-500/20 text-green-700 dark:text-green-400"
              : "bg-red-500/20 text-red-700 dark:text-red-400"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-primary/10 bg-background">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-primary/5">
              <th className="px-4 py-3 font-medium text-primary">
                {tTables("name")}
              </th>
              <th className="px-4 py-3 font-medium text-primary">{t("email")}</th>
              <th className="px-4 py-3 font-medium text-primary">{t("role")}</th>
              <th className="px-4 py-3 font-medium text-primary">
                {tTables("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="border-b border-primary/5 transition-colors hover:bg-primary/5"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <UserCog className="h-4 w-4" />
                      </div>
                    )}
                    <span className="font-medium text-foreground">
                      {user.name ?? "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/80">
                  {user.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value)
                    }
                    className="rounded-lg border border-primary/20 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {getRoleLabel(r)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSave(user.id)}
                    disabled={savingId === user.id || isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingId === user.id ? "..." : t("updateRole")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-foreground/60">
          {searchQuery ? t("noMatch") : t("noUsers")}
        </p>
      )}
    </div>
  );
}
