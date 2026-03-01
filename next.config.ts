import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const r2PublicHost = (() => {
  const raw = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  eslint: {
    // Temporary: allow production builds while we incrementally clean legacy lint issues.
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      ...(r2PublicHost
        ? [
            {
              protocol: "https" as const,
              hostname: r2PublicHost,
            },
          ]
        : []),
    ],
  },
};

const config = async (): Promise<NextConfig> => {
  if (process.env.NODE_ENV === "development") {
    await setupDevPlatform();
  }
  return withNextIntl(nextConfig);
};

export default config;
