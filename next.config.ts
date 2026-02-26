import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: {
    // Temporary: allow production builds while we incrementally clean legacy lint issues.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
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
