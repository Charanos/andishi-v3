import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// ADR-0004 (CMS). Column names mirror the frontend's existing `BlogPost`
// TS interface (src/data/blog.ts) closely - slug/title/category/excerpt/
// coverImage/author.*/datePublished/dateModified/readTime/featured/body/
// status - so wiring the blog pages to this table later is a
// near-zero-reshape swap.

export const blogCategoryEnum = pgEnum("blog_category", [
  "Hiring",
  "African Tech",
  "Remote Work",
  "Engineering",
]);

export const blogPostStatusEnum = pgEnum("blog_post_status", ["published", "draft", "archived"]);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: blogCategoryEnum("category").notNull(),
    excerpt: text("excerpt").notNull(),
    coverImage: text("cover_image").notNull(),
    authorName: text("author_name").notNull(),
    authorRole: text("author_role").notNull(),
    authorAvatarUrl: text("author_avatar_url").notNull(),
    // Display dates shown on the post - plain strings (e.g. "2026-05-08"),
    // independent of createdAt/updatedAt, so an admin can backdate a post
    // to when it was actually written or last revised.
    datePublished: text("date_published").notNull(),
    dateModified: text("date_modified").notNull(),
    readTime: integer("read_time").notNull().default(5),
    featured: boolean("featured").notNull().default(false),
    body: text("body").notNull().default(""),
    status: blogPostStatusEnum("status").notNull().default("draft"),
    authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("blog_posts_status_idx").on(table.status),
    categoryIdx: index("blog_posts_category_idx").on(table.category),
  }),
);

export type BlogPostRow = typeof blogPosts.$inferSelect;
export type NewBlogPostRow = typeof blogPosts.$inferInsert;
