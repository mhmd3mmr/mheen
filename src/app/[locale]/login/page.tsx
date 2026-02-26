"use client";

export const runtime = 'edge';

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Chrome } from "lucide-react";

function LoginCard() {
  const t = useTranslations("nav");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <div className="w-full max-w-md rounded-2xl border border-primary/10 bg-background p-8 shadow-lg">
      <h1 className="font-qomra text-2xl font-semibold text-primary md:text-3xl">
        {t("login")}
      </h1>
      <p className="mt-2 text-foreground/70">
        Sign in to access the Mheen Memory Archive dashboard.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border-2 border-primary/20 bg-primary px-6 py-3.5 font-medium text-background transition-colors hover:bg-primary/90 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
        <Chrome className="h-5 w-5" aria-hidden />
        Sign in with Google
      </button>
    </div>
  );
}

/**
 * Login page: centered card with Sign in with Google.
 * Uses design system colors (primary, background).
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-8">
      <Suspense fallback={<div className="h-48 w-80 animate-pulse rounded-2xl bg-primary/5" />}>
        <LoginCard />
      </Suspense>
    </div>
  );
}
