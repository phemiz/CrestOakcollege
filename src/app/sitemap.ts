import { MetadataRoute } from "next";
import { siteUrl } from "@/utils/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/academics",
    "/admissions",
    "/bursary",
    "/gallery",
    "/contact",
    "/news",
    "/login",
  ];

  return routes.map((route) => {
    const priority = route === "" ? 1.0 : 0.8;
    const changeFrequency = (route === "" || route === "/academics" || route === "/admissions" || route === "/news") 
      ? ("weekly" as const) 
      : ("monthly" as const);

    return {
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });
}
