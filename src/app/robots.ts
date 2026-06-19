import { MetadataRoute } from "next";
import { siteUrl } from "@/utils/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",   // Restrict Admin CMS pages from crawling
        "/portal/",  // Restrict protected student dashboard logs
        "/api/",     // Restrict public routing of background Server Action routers
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
