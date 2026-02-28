import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { FadeUp } from "@/components/FadeUp";
import {
  LayoutDashboard,
  Users,
  UserMinus,
  BookOpen,
  ShieldOff,
  UserCog,
  Images,
  ImagePlus,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const SIDEBAR_ITEMS = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, adminOnly: false },
  { key: "martyrs", href: "/admin/martyrs", icon: Users, adminOnly: false },
  { key: "detainees", href: "/admin/detainees", icon: UserMinus, adminOnly: false },
  { key: "stories", href: "/admin/stories", icon: BookOpen, adminOnly: false },
  { key: "communityPhotos", href: "/admin/community-photos", icon: Images, adminOnly: false },
  { key: "heroSlides", href: "/admin/hero-slides", icon: ImagePlus, adminOnly: true },
  { key: "users", href: "/admin/users", icon: UserCog, adminOnly: true },
] as const;

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }
  setRequestLocale(locale);

  const [tNav, tAdmin] = await Promise.all([
    getTranslations("nav"),
    getTranslations("Admin"),
  ]);
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role ?? "public";
  const isAdmin = role === "admin";
  const allowed = !!session?.user && (isAdmin || role === "contributor");

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-8">
        <FadeUp>
          <div className="flex max-w-md flex-col items-center rounded-2xl border border-primary/10 bg-background p-8 text-center shadow-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldOff className="h-8 w-8" />
            </div>
            <h1 className="mt-4 font-qomra text-2xl font-semibold text-primary">
              {tNav("accessDenied")}
            </h1>
            <p className="mt-2 text-foreground/70">
              You do not have permission to access this page.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 font-medium text-background transition-colors hover:bg-primary/90"
            >
              {tNav("home")}
            </Link>
          </div>
        </FadeUp>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col bg-background text-foreground md:flex-row">
      <aside className="border-b border-primary/10 bg-primary/10 md:w-64 md:border-b-0 md:border-e md:bg-primary/5">
        <div className="px-4 py-4 md:px-5 md:py-6">
          <h2 className="font-qomra text-lg font-semibold text-primary">
            {tNav("dashboard")}
          </h2>
          <nav className="mt-4 space-y-1" aria-label="Admin navigation">
            {SIDEBAR_ITEMS.filter((item) => !item.adminOnly || isAdmin).map(({ key, href, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span>{tAdmin(`sidebar.${key}`)}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

