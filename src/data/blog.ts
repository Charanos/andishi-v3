export type BlogPost = {
  slug: string;
  title: string;
  category: "Hiring" | "African Tech" | "Remote Work" | "Engineering";
  excerpt: string;
  coverImage: string;
  author: { name: string; role: string; avatarUrl: string };
  datePublished: string;
  dateModified: string;
  readTime: number;
  featured: boolean;
  body: string[]; // array of paragraph strings
  status: "published" | "draft" | "archived";
};

const DEFAULT_POSTS: BlogPost[] = [
  {
    slug: "how-to-brief-a-senior-engineer",
    title: "How to brief a senior engineer so matching works faster",
    category: "Hiring",
    excerpt:
      "The strongest hiring briefs describe ownership, context, stack, and risk. Here is the structure Andishi uses before shortlisting engineers.",
    coverImage: "/images/featured-blog.jpg",
    author: { name: "Ian Mwangi", role: "Founder, Andishi", avatarUrl: "/images/ian.jpg" },
    datePublished: "2026-05-08",
    dateModified: "2026-05-08",
    readTime: 5,
    featured: true,
    body: [
      "A strong engineering brief does not start with a list of frameworks. It starts with the problem the engineer must own and the decision they should help your team make faster.",
      "At Andishi, the most useful briefs cover the current product state, the team shape, the bottleneck, the production stack, timeline pressure, timezone needs, and the engagement model. That gives the matching team enough signal to shortlist for ownership instead of keywords.",
      "If you only know the outcome, say that plainly. A senior engineer can help shape the route, but they still need to understand the business constraint, users affected, and what success looks like after the first sprint.",
    ],
    status: "published",
  },
  {
    slug: "why-africa-is-a-strong-timezone-for-startups",
    title: "Why African engineering time zones work for global startups",
    category: "Remote Work",
    excerpt:
      "UTC+0 to UTC+3 gives meaningful overlap with Europe and useful daily touchpoints for US East teams.",
    coverImage: "/images/blog-image-2.jpg",
    author: { name: "Andishi Team", role: "Talent Operations", avatarUrl: "/logo.svg" },
    datePublished: "2026-05-06",
    dateModified: "2026-05-08",
    readTime: 4,
    featured: false,
    body: [
      "Remote hiring is not just about talent quality. It is also about overlap, handoff, and how much coordination tax the team pays every week.",
      "African engineering time zones commonly sit between UTC+0 and UTC+3. That creates clean overlap with European teams and a useful morning overlap with US East Coast teams. For many startups, that is enough for daily standups, pairing, technical decisions, and live issue resolution.",
      "The advantage becomes clearer when the engineer is senior. Fewer meetings are needed because ownership is higher, but the team still has enough overlap to build trust and unblock decisions quickly.",
    ],
    status: "published",
  },
  {
    slug: "production-ai-needs-product-engineers",
    title: "Production AI needs product engineers, not just model fluency",
    category: "Engineering",
    excerpt:
      "RAG quality, latency, cost, evaluation, and UX integration are product engineering problems as much as AI problems.",
    coverImage: "/images/blog-image-5.jpg",
    author: { name: "Andishi Team", role: "Engineering Notes", avatarUrl: "/logo.svg" },
    datePublished: "2026-05-04",
    dateModified: "2026-05-08",
    readTime: 6,
    featured: false,
    body: [
      "The distance between an AI demo and a reliable product feature is larger than most teams expect. The hard work lives in retrieval quality, evaluation, latency, cost controls, permissions, observability, and user experience.",
      "That is why Andishi treats AI hiring as product engineering hiring. The best AI engineer for a startup can work across APIs, data, prompts, evaluation traces, background jobs, deployment, and interface states.",
      "Model fluency matters, but it is not enough. Production teams need engineers who can explain tradeoffs, measure behavior, and keep a feature useful after the launch announcement has faded.",
    ],
    status: "published",
  },
  {
    slug: "what-vetting-should-prove",
    title: "What technical vetting should prove before an intro call",
    category: "Hiring",
    excerpt:
      "Good vetting proves ownership, communication, system judgment, and production experience before the client spends time interviewing.",
    coverImage: "/images/blog-image-8.jpg",
    author: { name: "Andishi Team", role: "Talent Operations", avatarUrl: "/logo.svg" },
    datePublished: "2026-05-02",
    dateModified: "2026-05-08",
    readTime: 5,
    featured: false,
    body: [
      "A senior engineer profile should carry more signal than a title and a list of tools. It should show what the engineer has owned, how they communicate, and where their judgment has been tested.",
      "Andishi vetting looks for production history, system design thinking, code review clarity, architecture tradeoffs, and references where possible. The point is not to make interviewing theatrical. The point is to reduce the client's uncertainty before the first call.",
      "The best intro call then becomes a focused technical conversation rather than a broad screening exercise.",
    ],
    status: "published",
  },
];

export const blogCategories = [
  "All",
  "Hiring",
  "African Tech",
  "Remote Work",
  "Engineering",
] as const;

const LOCAL_STORAGE_KEY = "andishi_blog_posts_v3";

export function getBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") return DEFAULT_POSTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
    return DEFAULT_POSTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_POSTS;
  }
}

export const blogPosts: BlogPost[] = typeof window === "undefined" ? DEFAULT_POSTS : getBlogPosts();

export function getPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function saveBlogPost(post: BlogPost): BlogPost[] {
  const current = getBlogPosts();
  const index = current.findIndex((p) => p.slug === post.slug);

  if (index >= 0) {
    current[index] = post;
  } else {
    current.push(post);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("blog_posts_updated"));
  }
  return current;
}

export function deleteBlogPost(slug: string): BlogPost[] {
  const current = getBlogPosts();
  const filtered = current.filter((p) => p.slug !== slug);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("blog_posts_updated"));
  }
  return filtered;
}

export function categorySlug(category: BlogPost["category"]) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function categoryFromSlug(slug: string) {
  return getBlogPosts().find((post) => categorySlug(post.category) === slug)?.category;
}
