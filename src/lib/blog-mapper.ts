import type { BlogPost } from "@/data/blog";
import type { BlogPostRow } from "@/db/schema/blog";

/**
 * Maps a DB blog_posts row (flat authorName/authorRole/authorAvatarUrl) onto
 * the frontend's `BlogPost` shape (nested `author` object) that every blog
 * UI component was built around.
 */
export function mapBlogPostRow(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    author: {
      name: row.authorName,
      role: row.authorRole,
      avatarUrl: row.authorAvatarUrl,
    },
    datePublished: row.datePublished,
    dateModified: row.dateModified,
    readTime: row.readTime,
    featured: row.featured,
    body: row.body,
    status: row.status,
  };
}
