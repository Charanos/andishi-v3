import type { Metadata } from "next";
import { blogPosts, getPost } from "@/data/blog";
import { siteConfig } from "@/config/site";
import { BlogPostDetailExperience } from "@/components/marketing/blog-post-detail-experience";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} - Andishi Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  return <BlogPostDetailExperience slug={slug} initialPost={post} />;
}
