import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow everything
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
      // AI crawlers — explicitly allowed on case study pages for AEO/answer engine visibility.
      // This is an intentional opt-in to AI citation; remove any entry below to opt a crawler out.
      {
        userAgent: "GPTBot",
        allow: ["/", "/work/", "/work"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/work/", "/work"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/work/", "/work"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/work/", "/work"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/work/", "/work"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
