import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { blogPosts, categorySlug } from "@/data/blog";
import { engineers } from "@/data/engineers";
import { skillDomainList } from "@/data/skills";
import { workProjects } from "@/content/work";
import { services } from "@/data/services";
import { fetchPublicProjects } from "@/lib/api/public-client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/services",
    "/work",
    "/about",
    "/contact",
    "/start-project",
    "/login",
    "/hire",
    "/hire/faq",
    "/engineers",
    "/skills",
    "/studio",
    "/blog",
    "/legal/privacy",
    "/legal/terms",
  ];

  // Fetch DB-published projects for dynamic /work/[slug] entries
  const dbProjects = await fetchPublicProjects().catch(() => []);
  const dbWorkSlugs = dbProjects
    .filter((p) => p.publicSlug)
    .map((p) => ({ slug: p.publicSlug!, updatedAt: p.updatedAt }));

  // Static fallback slugs not already covered by DB
  const dbSlugSet = new Set(dbWorkSlugs.map((p) => p.slug));
  const staticWorkSlugs = workProjects
    .filter((p) => !dbSlugSet.has(p.id))
    .map((p) => ({ slug: p.id, updatedAt: null }));

  const allWorkSlugs = [...dbWorkSlugs, ...staticWorkSlugs];

  const dynamicRoutes = [
    ...services.map((service) => `/services/${service.slug}`),
    ...engineers.map((engineer) => `/engineers/${engineer.slug}`),
    ...skillDomainList.map((domain) => `/skills/${domain.slug}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...new Set(blogPosts.map((post) => `/blog/category/${categorySlug(post.category)}`)),
  ];

  const staticEntries = [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date("2026-05-08"),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route.includes("/blog/") ? 0.6 : 0.8,
  }));

  const workEntries = allWorkSlugs.map(({ slug, updatedAt }) => ({
    url: `${siteConfig.url}/work/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt) : new Date("2026-05-08"),
    changeFrequency: "weekly" as const,
    priority: 0.9, // Case studies are primary conversion pages
  }));

  return [...staticEntries, ...workEntries];
}
