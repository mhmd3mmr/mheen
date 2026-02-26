import { FadeUp } from "@/components/FadeUp";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboardPage() {
  const tNav = await getTranslations("nav");
  const tAdmin = await getTranslations("Admin");

  // Dummy summary values; can be wired to DB counts later.
  const stats = [
    {
      key: "martyrs",
      label: tAdmin("sidebar.martyrs"),
      value: 12,
    },
    {
      key: "detainees",
      label: tAdmin("sidebar.detainees"),
      value: 5,
    },
    {
      key: "stories",
      label: tAdmin("sidebar.stories"),
      value: 3,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <FadeUp>
        <h1 className="font-qomra text-3xl font-semibold text-primary md:text-4xl">
          {tNav("dashboard")}
        </h1>
        <p className="mt-2 text-foreground/80">
          إدارة محتوى أرشيف مهين: الشهداء، المعتقلون، والقصص المرسلة.
        </p>
      </FadeUp>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ key, label, value }, i) => (
          <FadeUp key={key} delay={0.05 + i * 0.05}>
            <div className="rounded-xl border border-primary/10 bg-background/60 p-5 shadow-sm">
              <p className="text-sm text-foreground/70">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}

