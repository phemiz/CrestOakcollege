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
    "/login",
  ];

  return routes.map((route) => {
    // Priority levels: Homepage is highest (1.0), other core pages are high (0.8)
    const priority = route === "" ? 1.0 : 0.8;
    const changeFrequency = (route === "" || route === "/academics" || route === "/admissions") 
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
