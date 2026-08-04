import { MetadataRoute } from "next";
import { siteUrl } from "@/utils/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/*",
        "/portal/*",
        "/staff/*",
        "/bursary/*",
        "/api/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
