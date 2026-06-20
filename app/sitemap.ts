import type { MetadataRoute } from "next";
import { absoluteUrl, ROUTES } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-20");
  const pageRoutes = ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: route.priority,
  }));

  return [
    ...pageRoutes,
    {
      url: absoluteUrl("/llms.txt"),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: absoluteUrl("/ai.txt"),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];
}
