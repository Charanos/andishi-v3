import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { blogPosts, categorySlug } from "@/data/blog";
import { engineers } from "@/data/engineers";
import { skillDomainList } from "@/data/skills";
import { workProjects } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const dynamicRoutes = [
    ...engineers.map((engineer) => `/engineers/${engineer.slug}`),
    ...skillDomainList.map((domain) => `/skills/${domain.slug}`),
    ...workProjects.map((project) => `/work/${project.id}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...new Set(blogPosts.map((post) => `/blog/category/${categorySlug(post.category)}`)),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date("2026-05-08"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("/blog/") ? 0.6 : 0.8,
  }));
}
