import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/ar/admin/", "/en/admin/", "/admin/"],
      },
    ],
    sitemap: "https://miheen.com/sitemap.xml",
    host: "https://miheen.com",
  };
}
