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
  body: string; // Markdown content
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
    body: `
A strong engineering brief does not start with a list of frameworks. It starts with the problem the engineer must own and the decision they should help your team make faster.

### The Problem with Keyword Matching

When founders hire, they often default to a checklist of technologies: *React, Node, PostgreSQL, AWS*. While stack alignment is important, it is the lowest bar of qualification. The true cost of a bad hire isn't a lack of syntax knowledge; it's a lack of context. 

> "If you only know the outcome, say that plainly. A senior engineer can help shape the route, but they still need to understand the business constraint."

At Andishi, the most useful briefs cover:
1. **The Current Product State**: Is this greenfield, or are we scaling legacy code?
2. **The Team Shape**: Who are they collaborating with?
3. **The Bottleneck**: Why are you hiring *now*?
4. **Timeline Pressure**: What is the immediate sprint goal?

### Designing for Ownership

A senior engineer should not just be taking tickets from a backlog. They should be looking at the business constraint, the users affected, and what success looks like after the first sprint.

When you brief for context rather than keywords, the matching process is dramatically accelerated. We stop looking for someone who simply *knows* Next.js, and start looking for someone who has scaled a Next.js platform through the exact growth phase you are experiencing right now.
`,
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
    body: `
Remote hiring is not just about talent quality. It is also about overlap, handoff, and how much coordination tax the team pays every week.

### The Coordination Tax

When teams are spread across 8+ hour time zone differences, the cost of communication skyrockets. A simple question about a PR blocks a developer for an entire day. Standups become asynchronous text updates that lack nuance, and pair programming becomes impossible without someone working at 2:00 AM.

African engineering time zones commonly sit between **UTC+0** and **UTC+3**. 

### The Sweet Spot for Global Teams

This positioning creates clean overlap with European teams (almost 100% overlap) and a highly useful morning overlap with US East Coast teams (typically 4-5 hours). For many startups, that is the perfect window.

* **For US East Coast:** The African engineer has had their morning to do deep, uninterrupted work. By the time New York wakes up, PRs are ready for review, and there's a 4-hour window for live issue resolution, pairing, and daily standups.
* **For Europe (UK/EU):** It's a standard workday. Synchronous collaboration is seamless.

> "The advantage becomes clearer when the engineer is senior. Fewer meetings are needed because ownership is higher, but the team still has enough overlap to build trust and unblock decisions quickly."

By reducing the coordination tax, teams ship faster, experience less burnout, and maintain a healthier engineering culture.
`,
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
    body: `
The distance between an AI demo and a reliable product feature is larger than most teams expect. The hard work lives in retrieval quality, evaluation, latency, cost controls, permissions, observability, and user experience.

### The Illusion of the Demo

Anyone can build a wrapper around an LLM API in an afternoon. But what happens when the prompt injection attacks start? What happens when the RAG (Retrieval-Augmented Generation) pipeline hallucinates confident, dangerous answers based on outdated vector embeddings?

Building AI for production is fundamentally a product engineering challenge, not just a data science one.

### The Product Engineering Mindset

That is why Andishi treats AI hiring as product engineering hiring. The best AI engineer for a startup can work across the entire stack:
* **API Integration:** Managing rate limits, fallbacks, and streaming responses.
* **Data Pipelines:** Ensuring embeddings stay fresh and permissions are respected during retrieval.
* **Evaluation Traces:** Building systems to measure accuracy before a user sees a bad response.
* **UX Integration:** Designing interfaces that handle loading states gracefully and manage user expectations around AI output.

> "Model fluency matters, but it is not enough. Production teams need engineers who can explain tradeoffs, measure behavior, and keep a feature useful after the launch announcement has faded."

If your team is building AI features, you don't just need someone who has read the latest papers. You need an engineer who knows how to ship reliable, observable, and safe software.
`,
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
    body: `
A senior engineer profile should carry more signal than a title and a list of tools. It should show what the engineer has owned, how they communicate, and where their judgment has been tested.

### The Problem with LeetCode

Too many hiring processes index heavily on algorithmic puzzle-solving. While these platforms can prove baseline competence in data structures, they completely fail to measure what actually matters in a senior role: system design, architecture tradeoffs, and communication under pressure.

### What Real Vetting Looks Like

At Andishi, our vetting process looks for production history. We want to know:
1. **System Design Thinking:** Can you architect a feature that scales, rather than just writing a function that passes a test?
2. **Code Review Clarity:** Are your reviews helpful, empathetic, and focused on maintainability?
3. **Architecture Tradeoffs:** Can you explain *why* you chose a specific database over alternatives?

> "The point is not to make interviewing theatrical. The point is to reduce the client's uncertainty before the first call."

When vetting is done correctly, the intro call between a founder and an engineer transforms. It stops being a broad, stressful screening exercise, and becomes a focused, collaborative technical conversation about the actual problems the business is facing today.
`,
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

const LOCAL_STORAGE_KEY = "andishi_blog_posts_v4"; // incremented to clear old cache

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
