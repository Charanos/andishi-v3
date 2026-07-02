"use client";

import {
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useRef, useEffect } from "react";
import { faqItems } from "@/content/landing";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TestimonialsMarquee } from "./testimonials-marquee";
import { BlogPost, getBlogPosts, saveBlogPost, deleteBlogPost } from "@/data/blog";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { cn } from "@/lib/utils";



const topics = [
  "Senior Engineers",
  "AI Integration",
  "AWS Talent",
  "Web3 Engineers",
  "Team Extension",
  "Vetting",
  "African Tech Talent",
];

const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--on-surface) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

// Register GSAP ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function ArticleCard({
  article,
  isAdmin,
  onEdit,
  onDelete,
}: {
  article: BlogPost;
  isAdmin: boolean;
  onEdit: (post: BlogPost, e: React.MouseEvent) => void;
  onDelete: (slug: string, e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={cn(
        "article-card-anim group relative flex overflow-hidden transition-all duration-500",
        "md:rounded-[1.75rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:shadow-[var(--glass-inner-shadow)] md:backdrop-blur-md md:hover:-translate-y-1.5 md:hover:border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] md:hover:shadow-[0_24px_50px_rgba(0,0,0,0.08)]",
        "max-md:border-b max-md:border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:pb-12 max-md:mb-12 max-md:last:border-b-0 max-md:last:pb-0 max-md:last:mb-0",
        article.featured ? "flex-col lg:flex-row col-span-full" : "flex-col",
      )}
      style={{ willChange: "transform, opacity" }}
    >
      <Link href={`/blog/${article.slug}`} className="absolute inset-0 z-0" />

      <div
        className={cn(
          "relative overflow-hidden shrink-0 z-10",
          "max-md:rounded-2xl max-md:mt-2",
          article.featured ? "h-64 lg:h-auto lg:w-[50%]" : "h-56",
        )}
      >
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          sizes={
            article.featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"
          }
          className="object-cover saturate-[0.8] transition-transform duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-100"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/75 via-transparent to-transparent opacity-85" />
      </div>

      <div
        className={cn(
          "relative flex flex-col z-10 pointer-events-none",
          "max-md:px-0 max-md:pt-5 max-md:pb-0",
          article.featured ? "p-8 lg:p-14 lg:w-[50%] justify-center" : "p-6 lg:p-8 flex-1",
        )}
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-0.5 text-[0.66rem] font-mono uppercase tracking-[0.1em] text-[var(--tertiary)] shadow-sm">
            {article.category}
          </span>
          <span className="font-mono text-[0.7rem] tracking-tight text-[var(--on-surface-dim)]">
            {article.datePublished}
          </span>
          <span className="ml-auto text-[0.7rem] text-[var(--on-surface-dim)]">
            {article.readTime} min read
          </span>
        </div>

        <h3
          className={cn(
            "title-serif font-normal leading-tight text-[var(--on-surface)] transition-opacity duration-300 group-hover:opacity-75",
            article.featured
              ? "text-[2rem] sm:text-[2.2rem] lg:text-[2.6rem] tracking-tight mb-4"
              : "text-[1.45rem] mb-3",
          )}
        >
          {article.title}
        </h3>
        <p
          className={cn(
            "leading-[1.75] text-[var(--on-surface-dim)] font-light",
            article.featured ? "text-[1.05rem]" : "text-[0.92rem] line-clamp-3",
          )}
        >
          {article.excerpt}
        </p>

        {article.featured && (
          <div className="mt-8 border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] pt-6 hidden sm:block">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Production ownership"],
                ["02", "Reference checks"],
                ["03", "Timezone fit"],
              ].map(([num, item]) => (
                <div key={item}>
                  <p className="font-mono text-[0.66rem] tracking-tight text-[color-mix(in_srgb,var(--on-surface-dim)_54%,transparent)] mb-1">
                    {num}
                  </p>
                  <p className="text-[0.88rem] font-medium leading-snug text-[var(--on-surface)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={cn("mt-auto pt-8 flex items-center gap-3", article.featured ? "mt-10" : "")}
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[var(--glass-border)] bg-white/5">
            <Image
              src={article.author.avatarUrl}
              alt={article.author.name}
              width={36}
              height={36}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-[0.82rem] font-medium text-[var(--on-surface)] leading-none mb-0.5">
              {article.author.name}
            </div>
            <div className="text-[0.66rem] text-[var(--on-surface-dim)] font-medium leading-none">
              {article.author.role}
            </div>
          </div>
          <span className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-transform duration-300 group-hover:rotate-45 group-hover:text-[var(--on-surface)] group-hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
            <IconExternalLink size={15} stroke={1.6} />
          </span>
        </div>
      </div>

      {/* Admin actions overlay */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
          <button
            onClick={(e) => onEdit(article, e)}
            className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] transition-all cursor-pointer"
            title="Edit Post"
          >
            <IconEdit size={13} />
          </button>
          <button
            onClick={(e) => onDelete(article.slug, e)}
            className="p-1.5 rounded-lg border border-red-500/20 bg-[var(--surface-low)] text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Delete Post"
          >
            <IconTrash size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    if (typeof window === "undefined") return [];
    return getBlogPosts().filter((p) => p.status === "published");
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const container = useRef<HTMLElement>(null);

  const refreshPosts = () => {
    setPosts(getBlogPosts().filter((p) => p.status === "published"));
  };

  useEffect(() => {
    window.addEventListener("blog_posts_updated", refreshPosts);

    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("andishi_admin_sim_logged_in") === "true");
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    window.addEventListener("admin_sim_changed", checkAdmin);

    return () => {
      window.removeEventListener("blog_posts_updated", refreshPosts);
      window.removeEventListener("storage", checkAdmin);
      window.removeEventListener("admin_sim_changed", checkAdmin);
    };
  }, []);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".article-card-anim");

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cards[0] as Element,
              start: "top 85%",
            },
          },
        );
      }
    },
    { dependencies: [posts], scope: container },
  );

  const handleEditInline = (post: BlogPost, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPost({ ...post });
    setIsNew(false);
    setModalOpen(true);
  };

  const handleCreateInline = () => {
    setEditingPost({
      slug: "",
      title: "",
      category: "Hiring",
      excerpt: "",
      coverImage: "/images/featured-blog.jpg",
      author: { name: "Ian Mwangi", role: "Founder, Andishi", avatarUrl: "/images/ian.jpg" },
      datePublished: new Date().toISOString().split("T")[0],
      dateModified: new Date().toISOString().split("T")[0],
      readTime: 5,
      featured: false,
      body: ["First paragraph...", "Second paragraph..."],
      status: "published",
    });
    setIsNew(true);
    setModalOpen(true);
  };

  const handleDeleteInline = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteBlogPost(slug);
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editingPost.title || !editingPost.excerpt) {
      alert("Title and Excerpt are required.");
      return;
    }

    // Generate slug if new
    const payload = isNew
      ? {
          ...editingPost,
          slug: editingPost.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-"),
        }
      : editingPost;

    saveBlogPost(payload);
    setModalOpen(false);
    setEditingPost(null);
  };

  // Sort: Featured first, then by date desc
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime();
  });

  // Limit homepage blog showcase to at most 3 articles
  const displayPosts = sortedPosts.slice(0, 3);

  return (
    <section
      ref={container}
      className="relative isolate overflow-hidden bg-[var(--bg)] pb-16 sm:pb-24 lg:pb-32 pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={textureStyle}
      />
      <TestimonialsMarquee />

      <div className="relative z-[1] mt-16 px-5 sm:mt-24 sm:px-8 lg:mt-28 lg:px-10">
        <div className="mx-auto max-w-[92rem]">
          {/* Header controls row */}
          <div className="mb-14 flex items-end justify-between border-b border-[var(--glass-border)] pb-8">
            <div className="flex flex-col max-md:items-center max-md:text-center md:items-start">
              <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)] font-medium">
                <span className="h-px w-7 bg-[var(--tertiary)]" />
                From the talent desk
                <span className="h-px w-7 bg-[var(--tertiary)]" />
              </p>
              <h2 className="title-serif max-w-[20ch] text-[clamp(2.75rem,5vw,4.5rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
                Hiring notes. Talent proof. Startup context.
              </h2>
            </div>
            {isAdmin && (
              <button
                onClick={handleCreateInline}
                className="flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 font-mono text-[0.72rem] uppercase tracking-wider text-black transition-all hover:opacity-90 hover:scale-[1.01] cursor-pointer shrink-0 ml-4 max-md:hidden"
              >
                <IconPlus size={16} /> Create Article
              </button>
            )}
          </div>

          {/* Admin mobile creation trigger */}
          {isAdmin && (
            <div className="mb-6 flex justify-end md:hidden">
              <button
                onClick={handleCreateInline}
                className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[0.66rem] font-mono uppercase tracking-wider text-emerald-400"
              >
                <IconPlus size={12} /> Create Article
              </button>
            </div>
          )}

          {/* Articles list grid */}
          {displayPosts.length === 0 ? (
            <div className="text-center py-16 text-[var(--on-surface-dim)] opacity-60">
              No blog posts published yet.
            </div>
          ) : (
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
              <ArticleCard
                article={displayPosts[0]}
                isAdmin={isAdmin}
                onEdit={handleEditInline}
                onDelete={handleDeleteInline}
              />
              {displayPosts.slice(1).map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  isAdmin={isAdmin}
                  onEdit={handleEditInline}
                  onDelete={handleDeleteInline}
                />
              ))}
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] px-8 py-3.5 text-[0.92rem] font-medium text-[var(--on-surface)] shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:shadow-md"
            >
              Browse all articles
              <IconArrowRight size={16} stroke={1.7} />
            </Link>
          </div>
        </div>
      </div>

      {/* Inline Blog Edit Modal Form */}
      {modalOpen && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="title-serif text-[1.2rem] text-[var(--on-surface)]">
                {isNew ? "Create Blog Post Inline" : "Edit Blog Post Inline"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Article Title
                  </label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Article title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Category
                  </label>
                  <select
                    value={editingPost.category}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        category: e.target.value as BlogPost["category"],
                      })
                    }
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
                  >
                    {["Hiring", "African Tech", "Remote Work", "Engineering"].map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        className="bg-[var(--surface)] text-[var(--on-surface)]"
                      >
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                  Excerpt Summary
                </label>
                <textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] leading-relaxed"
                  placeholder="A short summary of the article..."
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={editingPost.coverImage}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
                    placeholder="/images/blog-image-1.jpg"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={editingPost.readTime}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, readTime: parseInt(e.target.value) || 5 })
                    }
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Options
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 text-[0.8rem] text-[var(--on-surface)] select-none">
                      <input
                        type="checkbox"
                        checked={editingPost.featured}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, featured: e.target.checked })
                        }
                        className="rounded border-[var(--glass-border)] bg-transparent text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      Featured
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--glass-border)] pt-4">
                <h4 className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] mb-3">
                  Author Profile
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[0.6rem] font-mono uppercase text-[var(--on-surface-dim)] mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={editingPost.author.name}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          author: { ...editingPost.author, name: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-mono uppercase text-[var(--on-surface-dim)] mb-1">
                      Author Role
                    </label>
                    <input
                      type="text"
                      value={editingPost.author.role}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          author: { ...editingPost.author, role: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-mono uppercase text-[var(--on-surface-dim)] mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={editingPost.author.avatarUrl}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          author: { ...editingPost.author, avatarUrl: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="text-left">
                <MarkdownEditor
                  label="Article Body Content"
                  value={editingPost.body.join("\n\n")}
                  onChange={(val) =>
                    setEditingPost({
                      ...editingPost,
                      body: val.split("\n\n").filter(Boolean),
                    })
                  }
                  placeholder="Separate paragraphs by double newlines. Markdown is allowed..."
                  rows={8}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--glass-border)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-[var(--glass-border)] bg-transparent px-4 py-2 text-[0.74rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-full bg-[var(--on-surface)] px-5 py-2 text-[0.74rem] font-mono uppercase tracking-wider text-[var(--bg)] hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <IconCheck size={12} /> Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function FaqNewsletterSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const faqItems = gsap.utils.toArray(".faq-item-anim");
      if (faqItems.length > 0) {
        gsap.fromTo(
          faqItems,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: faqItems[0] as Element,
              start: "top 85%",
            },
          },
        );
      }

      const newsletter = document.querySelector(".newsletter-anim");
      if (newsletter) {
        gsap.fromTo(
          newsletter,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: newsletter,
              start: "top 85%",
            },
          },
        );
      }
    },
    { scope: container },
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@")) {
      setError("Invalid email address. Try again.");
      return;
    }

    setError("");
    setSubscribed(true);
  };

  return (
    <section
      ref={container}
      id="faq"
      className="relative isolate border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_42%,var(--bg))]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={textureStyle}
      />
      <div className="relative z-[1] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[92rem] lg:grid-cols-2">
          {/* FAQ Column */}
          <div className="border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-16 sm:py-20 lg:border-r lg:py-24 lg:pr-14">
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)]">
              <span className="h-px w-7 bg-[var(--tertiary)]" />
              Common questions
            </p>
            <h2 className="title-serif max-w-full text-[clamp(2.3rem,4.3vw,3.35rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
              Everything you want to ask.
            </h2>
            <p className="body-md my-8 text-[0.98rem] leading-[1.75] text-[var(--on-surface-dim)]">
              Honest answers before we ever match profiles.
            </p>

            <div className="mt-10 divide-y divide-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] border-y border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              {faqItems.slice(0, 5).map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <article key={item.q} className="faq-item-anim relative group">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_40%,transparent)] sm:py-6"
                      aria-expanded={isOpen}
                    >
                      <span
                        className="font-mono text-[0.72rem] tracking-tight transition-colors duration-300"
                        style={{
                          color: isOpen
                            ? "var(--on-surface)"
                            : "color-mix(in srgb, var(--on-surface-dim) 52%, transparent)",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="flex-1 text-[1.02rem] font-medium leading-snug transition-colors duration-300 sm:text-[1.08rem]"
                        style={{
                          color: isOpen ? "var(--on-surface)" : "var(--on-surface-dim)",
                        }}
                      >
                        {item.q}
                      </span>
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300"
                        style={{
                          borderColor: isOpen
                            ? "color-mix(in srgb, var(--on-surface) 28%, transparent)"
                            : "var(--glass-border)",
                          backgroundColor: isOpen
                            ? "color-mix(in srgb, var(--on-surface) 6%, transparent)"
                            : "var(--glass-bg)",
                          color: isOpen
                            ? "var(--on-surface)"
                            : "color-mix(in srgb, var(--on-surface-dim) 62%, transparent)",
                          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        <IconPlus size={15} stroke={1.7} />
                      </span>
                    </button>
                    <div
                      className="overflow-hidden pl-10 transition-all duration-500"
                      style={{
                        maxHeight: isOpen ? 260 : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="pb-5 text-[0.94rem] leading-[1.8] text-[var(--on-surface-dim)] sm:pb-6">
                        {item.a}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-16 sm:py-20 lg:border-t-0 lg:py-24 lg:pl-14">
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)]">
              <span className="h-px w-7 bg-[var(--tertiary)]" />
              Stay in the loop
            </p>
            <h2 className="title-serif max-w-full text-[clamp(2.3rem,4.3vw,3.35rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
              The African engineering talent dispatch.
            </h2>
            <p className="body-md my-8 max-w-xl text-[0.98rem] leading-[1.75] text-[var(--on-surface-dim)]">
              Bi-weekly. No fluff. Notes on hiring senior engineers, evaluating production skill,
              and building with African technical talent.
            </p>

            <div className="mt-8 flex flex-wrap gap-5">
              {[
                ["1.2k", "Subscribers"],
                ["68%", "Open rate"],
                ["2x", "Per month"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={
                    index > 0
                      ? "border-l border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] pl-5"
                      : ""
                  }
                >
                  <p className="font-mono text-[1.35rem] leading-none tracking-tight text-[var(--on-surface)]">
                    {value}
                  </p>
                  <p className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={onSubmit} className="newsletter-anim mt-10">
              {subscribed ? (
                <div className="flex items-center gap-4 rounded-[1.25rem] border border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-6 shadow-sm backdrop-blur-md">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] text-[var(--on-surface)]">
                    <IconCheck size={20} stroke={2} />
                  </span>
                  <div>
                    <p className="text-[1.05rem] font-medium tracking-tight text-[var(--on-surface)]">
                      Subscribed.
                    </p>
                    <p className="text-[0.92rem] text-[var(--on-surface-dim)]">
                      First issue lands this week. Welcome to the dispatch.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex overflow-hidden rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] p-1.5 transition-all duration-300 focus-within:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] focus-within:shadow-[0_8px_30px_color-mix(in_srgb,var(--on-surface)_6%,transparent)] backdrop-blur-md">
                    <input
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-transparent px-5 py-3 text-[0.95rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)]"
                    />
                    <button
                      type="submit"
                      className="group flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-6 py-3 font-medium text-[var(--bg)] transition-transform hover:scale-[1.02]"
                    >
                      Subscribe
                      <IconArrowRight
                        size={16}
                        stroke={2}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                  {error && (
                    <p className="absolute -bottom-7 left-5 text-[0.85rem] text-red-400">{error}</p>
                  )}
                </div>
              )}
            </form>

            <div className="my-10">
              <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                What we cover
              </p>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 text-[0.8rem] text-[var(--on-surface-dim)] transition-colors hover:border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] hover:text-[var(--on-surface)]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogAndFaqNewsletter() {
  return (
    <>
      <BlogSection />
      <FaqNewsletterSection />
    </>
  );
}
