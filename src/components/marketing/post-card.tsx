import Image from "next/image";
import Link from "next/link";
import { GlassPanel } from "@/components/marketing/public-page";
import type { BlogPost } from "@/data/blog";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <GlassPanel className="h-full p-0 sm:p-0">
        <div className="relative aspect-video overflow-hidden border-b border-[var(--glass-border)]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 26rem, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="p-5">
          <p className="label-caps text-[var(--secondary)]">{post.category}</p>
          <h3 className="mt-4 text-[1.12rem] font-medium leading-tight text-[var(--on-surface)]">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
            {post.excerpt}
          </p>
          <div className="mt-5 flex items-center justify-between gap-3 text-[0.8rem] text-[var(--on-surface-dim)]">
            <span>{post.author.name}</span>
            <span className="font-mono">{post.readTime} min</span>
          </div>
        </div>
      </GlassPanel>
    </Link>
  );
}
