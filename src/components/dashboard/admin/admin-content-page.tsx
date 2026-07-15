"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconArrowRight,
  IconBook,
  IconBriefcase,
  IconCheck,
  IconClock,
  IconEdit,
  IconEye,
  IconFileText,
  IconFilter,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconTrendingUp,
  IconUsers,
  IconX,
  IconStar,
  type Icon,
} from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardBarChart,
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { BlogPost } from "@/data/blog";
import { mapBlogPostRow } from "@/lib/blog-mapper";

type AdminBlogPost = BlogPost & { dbId: string };

type ContentStatus = "idea" | "draft" | "review" | "scheduled" | "published" | "refresh";
type ContentType = "case_study" | "engineer_story" | "hiring_guide" | "proof_asset" | "social";
type SortKey = "impact" | "freshness" | "pipeline" | "status";

type ContentAsset = {
  activity: string[];
  audience: "client" | "developer" | "public" | "internal";
  channel: string;
  conversionLift: number;
  dueDate: string;
  id: string;
  linkedClient: string;
  linkedDeveloper: string;
  owner: string;
  proofSignal: string;
  publishTarget: string;
  quality: number;
  risk: string;
  status: ContentStatus;
  summary: string;
  title: string;
  type: ContentType;
};

const statusOrder: ContentStatus[] = [
  "idea",
  "draft",
  "review",
  "scheduled",
  "published",
  "refresh",
];
const statusMeta: Record<
  ContentStatus,
  {
    label: string;
    next: ContentStatus | null;
    tone: "active" | "available" | "neutral" | "overdue" | "pending";
  }
> = {
  draft: { label: "Draft", next: "review", tone: "pending" },
  idea: { label: "Idea", next: "draft", tone: "neutral" },
  published: { label: "Published", next: "refresh", tone: "active" },
  refresh: { label: "Refresh", next: "review", tone: "overdue" },
  review: { label: "Review", next: "scheduled", tone: "pending" },
  scheduled: { label: "Scheduled", next: "published", tone: "available" },
};

const typeLabel: Record<ContentType, string> = {
  case_study: "Case study",
  engineer_story: "Engineer story",
  hiring_guide: "Hiring guide",
  proof_asset: "Proof asset",
  social: "Social",
};

const contentSeed: ContentAsset[] = [
  {
    activity: [
      "Client quote approved",
      "Payment reconciliation metric verified",
      "SEO outline attached",
    ],
    audience: "client",
    channel: "Website / Case studies",
    conversionLift: 18,
    dueDate: "Jun 7",
    id: "content-fintech-case",
    linkedClient: "SokoPay",
    linkedDeveloper: "Kwame Mensah",
    owner: "Content",
    proofSignal: "98.3% payment match rate",
    publishTarget: "/work/payment-reconciliation",
    quality: 92,
    risk: "Needs finance screenshot redaction",
    status: "review",
    summary:
      "Fintech case study proving payments depth, senior backend judgment, and production reconciliation outcomes.",
    title: "Payment reconciliation case study",
    type: "case_study",
  },
  {
    activity: ["Amina interview completed", "Portfolio proof selected", "Draft hero copy ready"],
    audience: "client",
    channel: "Engineer profile / LinkedIn",
    conversionLift: 14,
    dueDate: "Jun 10",
    id: "content-amina-story",
    linkedClient: "Kijani Analytics",
    linkedDeveloper: "Amina Otieno",
    owner: "Maya",
    proofSignal: "Production RAG support automation",
    publishTarget: "/engineers/amina-otieno",
    quality: 88,
    risk: "Confirm what client names can be public",
    status: "draft",
    summary:
      "Founder-facing AI engineer story that supports matching confidence for senior LLM workflow briefs.",
    title: "Amina AI product engineer story",
    type: "engineer_story",
  },
  {
    activity: [
      "Outline mapped to public FAQ",
      "Search intent reviewed",
      "Examples pulled from briefs",
    ],
    audience: "public",
    channel: "Blog / SEO",
    conversionLift: 22,
    dueDate: "Jun 12",
    id: "content-ai-guide",
    linkedClient: "Pipeline",
    linkedDeveloper: "Network",
    owner: "Dennis",
    proofSignal: "48-hour matching and senior-only vetting",
    publishTarget: "/blog/hiring-senior-ai-engineers",
    quality: 81,
    risk: "Needs technical accuracy pass",
    status: "scheduled",
    summary: "Hiring guide explaining how CTOs should evaluate senior AI integration engineers.",
    title: "Hiring senior AI engineers guide",
    type: "hiring_guide",
  },
  {
    activity: [
      "Guarantee copy checked",
      "Placement workflow screenshot updated",
      "Public process step linked",
    ],
    audience: "public",
    channel: "Landing page proof",
    conversionLift: 9,
    dueDate: "Live",
    id: "content-guarantee-proof",
    linkedClient: "All clients",
    linkedDeveloper: "All developers",
    owner: "Content",
    proofSignal: "30-day placement guarantee",
    publishTarget: "/",
    quality: 95,
    risk: "Refresh quarterly",
    status: "published",
    summary: "Proof asset supporting the public promise that Andishi stays on after placement.",
    title: "30-day guarantee proof block",
    type: "proof_asset",
  },
  {
    activity: [
      "Draft waiting on delivery metric",
      "Client approval not requested",
      "Before/after visuals needed",
    ],
    audience: "client",
    channel: "Website / Sales enablement",
    conversionLift: 11,
    dueDate: "Jun 14",
    id: "content-edtech-refresh",
    linkedClient: "EdTech cohort",
    linkedDeveloper: "Full-stack bench",
    owner: "Content",
    proofSignal: "12+ schools onboarded",
    publishTarget: "/work/school-operations",
    quality: 63,
    risk: "Old proof asset feels weaker than current dashboard quality",
    status: "refresh",
    summary:
      "Refresh old EdTech case study so it matches the newer talent-first Andishi positioning.",
    title: "School operations case study refresh",
    type: "case_study",
  },
];

export function AdminContentPage() {
  const [assets, setAssets] = useState(contentSeed);
  const [selectedId, setSelectedId] = useState(contentSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("impact");
  const [drawerAsset, setDrawerAsset] = useState<ContentAsset | null>(null);
  const [confirmAsset, setConfirmAsset] = useState<ContentAsset | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<ContentAsset | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<"proof" | "blogs">("proof");

  // Blogs Management State
  const [blogPostsState, setBlogPostsState] = useState<AdminBlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>("all");
  const [blogStatusFilter, setBlogStatusFilter] = useState<string>("all");
  const { notify } = useToast();

  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isNewBlog, setIsNewBlog] = useState(false);

  const [deleteBlogConfirmOpen, setDeleteBlogConfirmOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [isDeletingBlog, setIsDeletingBlog] = useState(false);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const res = await fetch("/api/blog?all=true");
        if (res.ok) {
          const data = await res.json();
          setBlogPostsState(
            (data.posts ?? []).map((row: Parameters<typeof mapBlogPostRow>[0]) => ({
              ...mapBlogPostRow(row),
              dbId: row.id,
            })),
          );
        } else {
          notify("Failed to load blog posts", "error");
        }
      } catch {
        notify("Failed to load blog posts", "error");
      } finally {
        setBlogLoading(false);
      }
    };
    loadBlogPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateBlog = () => {
    setEditingBlogPost({
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
      body: "First paragraph...\n\nSecond paragraph...",
      status: "published",
    });
    setIsNewBlog(true);
  };

  const handleEditBlog = (post: BlogPost) => {
    setEditingBlogPost({ ...post });
    setIsNewBlog(false);
  };

  const handleDeleteBlogClick = (slug: string) => {
    setBlogToDelete(slug);
    setDeleteBlogConfirmOpen(true);
  };

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;
    const target = blogPostsState.find((p) => p.slug === blogToDelete);
    if (!target) return;

    setIsDeletingBlog(true);
    try {
      const res = await fetch(`/api/blog/posts/${target.dbId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setBlogPostsState((prev) => prev.filter((p) => p.slug !== blogToDelete));
      notify("Blog post deleted", "success");
    } catch {
      notify("Failed to delete blog post", "error");
    } finally {
      setIsDeletingBlog(false);
      setDeleteBlogConfirmOpen(false);
      setBlogToDelete(null);
    }
  };

  const saveBlogForm = async (post: BlogPost) => {
    const payload = {
      slug: post.slug,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      authorName: post.author.name,
      authorRole: post.author.role,
      authorAvatarUrl: post.author.avatarUrl,
      datePublished: post.datePublished,
      dateModified: new Date().toISOString().split("T")[0],
      readTime: post.readTime,
      featured: post.featured,
      body: post.body,
      status: post.status,
    };

    try {
      let savedRow: Parameters<typeof mapBlogPostRow>[0];
      if (isNewBlog) {
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        savedRow = (await res.json()).post;
      } else {
        const existing = blogPostsState.find(
          (p) => p.slug === (editingBlogPost?.slug ?? post.slug),
        );
        if (!existing) throw new Error("Post not found");
        const res = await fetch(`/api/blog/posts/${existing.dbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        savedRow = (await res.json()).post;
      }

      const saved: AdminBlogPost = { ...mapBlogPostRow(savedRow), dbId: savedRow.id };
      setBlogPostsState((prev) =>
        isNewBlog ? [...prev, saved] : prev.map((p) => (p.dbId === saved.dbId ? saved : p)),
      );
      setEditingBlogPost(null);
      notify(isNewBlog ? "Blog post created" : "Blog post updated", "success");
    } catch {
      notify("Failed to save blog post", "error");
    }
  };

  const filteredBlogs = useMemo(() => {
    const needle = blogSearch.trim().toLowerCase();
    return blogPostsState.filter((post) => {
      const haystack =
        `${post.title} ${post.excerpt} ${post.author.name} ${post.category}`.toLowerCase();
      const matchesSearch = !needle || haystack.includes(needle);
      const matchesCategory = blogCategoryFilter === "all" || post.category === blogCategoryFilter;
      const matchesStatus = blogStatusFilter === "all" || post.status === blogStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogPostsState, blogSearch, blogCategoryFilter, blogStatusFilter]);

  const blogStats = useMemo(() => {
    const total = blogPostsState.length;
    const published = blogPostsState.filter((p) => p.status === "published").length;
    const drafts = blogPostsState.filter((p) => p.status === "draft").length;
    const featured = blogPostsState.filter((p) => p.featured).length;
    const avgRead =
      total > 0 ? Math.round(blogPostsState.reduce((sum, p) => sum + p.readTime, 0) / total) : 0;
    return { total, published, drafts, featured, avgRead };
  }, [blogPostsState]);

  const blogRows = useMemo(() => {
    return filteredBlogs.map((post) => ({
      ...post,
      id: post.slug,
    }));
  }, [filteredBlogs]);

  const blogColumns = useMemo<Array<OperationalTableColumn<BlogPost & { id: string }>>>(
    () => [
      {
        key: "title",
        label: "Article Title",
        priority: true,
        render: (post) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
              {post.title}
            </p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">
              {post.category} · {post.readTime} min read
            </p>
          </div>
        ),
      },
      {
        key: "author",
        label: "Author",
        render: (post) => (
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-[var(--glass-border)] bg-white/5">
              <Image
                src={post.author.avatarUrl}
                alt={post.author.name}
                width={24}
                height={24}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-[0.8rem] text-[var(--on-surface)]">{post.author.name}</span>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (post) => (
          <StatusBadge
            label={
              post.status === "published"
                ? "Published"
                : post.status === "draft"
                  ? "Draft"
                  : "Archived"
            }
            tone={
              post.status === "published"
                ? "active"
                : post.status === "draft"
                  ? "pending"
                  : "neutral"
            }
          />
        ),
      },
      { key: "datePublished", label: "Date", render: (post) => post.datePublished },
      {
        key: "featured",
        label: "Featured",
        render: (post) =>
          post.featured ? (
            <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-[0.7rem] uppercase">
              <IconStar size={12} fill="currentColor" /> Yes
            </span>
          ) : (
            <span className="text-[var(--on-surface-dim)] opacity-55">No</span>
          ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (post) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEditBlog(post);
              }}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[var(--glass-border)] bg-white/5 text-[var(--on-surface-dim)] transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:text-[var(--on-surface)] active:scale-95"
              title="Edit post"
            >
              <IconEdit size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBlogClick(post.slug);
              }}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 transition-all duration-200 hover:scale-105 hover:bg-red-500/20 active:scale-95"
              title="Delete post"
            >
              <IconTrash size={14} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assets
      .filter((asset) => {
        const haystack =
          `${asset.title} ${asset.summary} ${asset.owner} ${asset.linkedClient} ${asset.linkedDeveloper} ${asset.proofSignal}`.toLowerCase();
        return (
          (!needle || haystack.includes(needle)) &&
          (statusFilter === "all" || asset.status === statusFilter) &&
          (typeFilter === "all" || asset.type === typeFilter)
        );
      })
      .sort((a, b) => {
        if (sortKey === "freshness")
          return a.status === "refresh" ? -1 : b.status === "refresh" ? 1 : 0;
        if (sortKey === "pipeline") return b.quality - a.quality;
        if (sortKey === "status")
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        return b.conversionLift - a.conversionLift;
      });
  }, [assets, query, sortKey, statusFilter, typeFilter]);

  const stats = useMemo(() => buildContentStats(assets), [assets]);

  const columns = useMemo<Array<OperationalTableColumn<ContentAsset>>>(
    () => [
      {
        key: "title",
        label: "Asset",
        priority: true,
        render: (asset) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
              {asset.title}
            </p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">
              {typeLabel[asset.type]} / {asset.channel}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (asset) => (
          <StatusBadge
            label={statusMeta[asset.status].label}
            tone={statusMeta[asset.status].tone}
          />
        ),
      },
      { key: "quality", label: "Quality", mono: true, render: (asset) => `${asset.quality}%` },
      {
        key: "conversionLift",
        label: "Lift",
        mono: true,
        render: (asset) => `+${asset.conversionLift}%`,
      },
      { key: "owner", label: "Owner", hideOnMobile: true },
      { key: "dueDate", label: "Due", hideOnMobile: true },
    ],
    [],
  );

  const advanceAsset = (asset: ContentAsset) => {
    const next = statusMeta[asset.status].next;
    if (!next) return;
    const updated: ContentAsset = {
      ...asset,
      activity: [`Moved to ${statusMeta[next].label}`, ...asset.activity],
      quality: next === "published" ? Math.max(asset.quality, 90) : asset.quality,
      status: next,
    };
    setAssets((current) => current.map((item) => (item.id === asset.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerAsset((current) => (current?.id === asset.id ? updated : current));
  };

  const createAsset = (payload: {
    title: string;
    type: ContentType;
    linkedClient: string;
    proofSignal: string;
  }) => {
    const created: ContentAsset = {
      activity: ["Content asset created", "Proof owner assigned", "Review checklist opened"],
      audience: "public",
      channel: "Website",
      conversionLift: 5,
      dueDate: "TBD",
      id: `content-${Date.now()}`,
      linkedClient: payload.linkedClient,
      linkedDeveloper: "Network",
      owner: "Content",
      proofSignal: payload.proofSignal,
      publishTarget: "/",
      quality: 42,
      risk: "Needs proof validation",
      status: "idea",
      summary: "New proof asset created from the content operations workspace.",
      title: payload.title,
      type: payload.type,
    };
    setAssets((current) => [created, ...current]);
    setSelectedId(created.id);
    setDrawerAsset(created);
    setCreateOpen(false);
  };

  const updateAsset = (
    asset: ContentAsset,
    patch: Pick<
      ContentAsset,
      "owner" | "proofSignal" | "publishTarget" | "quality" | "risk" | "summary" | "title"
    >,
  ) => {
    const updated: ContentAsset = {
      ...asset,
      ...patch,
      activity: ["Proof asset edited", ...asset.activity],
    };
    setAssets((current) => current.map((item) => (item.id === asset.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerAsset((current) => (current?.id === asset.id ? updated : current));
    setEditAsset(null);
  };

  const archiveAsset = () => {
    if (!confirmAsset) return;
    const next = assets.filter((asset) => asset.id !== confirmAsset.id);
    setAssets(next);
    if (selectedId === confirmAsset.id) setSelectedId(next[0]?.id ?? "");
    setConfirmAsset(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Content operations"
        description="Operate the proof engine and editorial desk behind Andishi: case studies, client reviews, hiring guides, and dynamic blog posts."
        status={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={`${stats.published} proof live`} tone="active" />
            <StatusBadge label={`${blogStats.published} blogs live`} tone="available" />
          </div>
        }
        actions={
          activeTab === "proof" ? (
            <>
              <button
                type="button"
                onClick={() => setStatusFilter("refresh")}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
              >
                <IconRefresh size={16} stroke={1.7} />
                Refresh proof
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)]"
              >
                <IconPlus size={16} stroke={1.8} />
                New asset
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCreateBlog}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)]"
            >
              <IconPlus size={16} stroke={1.8} />
              New blog post
            </button>
          )
        }
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-[var(--glass-border)] -mt-4">
        <button
          type="button"
          onClick={() => setActiveTab("proof")}
          className={cn(
            "px-6 py-3 text-[0.74rem] font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px font-medium cursor-pointer",
            activeTab === "proof"
              ? "border-[var(--primary)] text-[var(--on-surface)]"
              : "border-transparent text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
          )}
        >
          Proof Assets ({assets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("blogs")}
          className={cn(
            "px-6 py-3 text-[0.74rem] font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px font-medium cursor-pointer",
            activeTab === "blogs"
              ? "border-[var(--primary)] text-[var(--on-surface)]"
              : "border-transparent text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
          )}
        >
          Blog Posts ({blogPostsState.length})
        </button>
      </div>

      {activeTab === "proof" ? (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              chart="bar"
              data={[12, 16, 22, 25, stats.total]}
              icon={IconBook}
              label="Proof assets"
              trend={`${stats.review} in review`}
              value={String(stats.total)}
            />
            <KpiCard
              data={[8, 10, 12, 14, stats.avgLift]}
              icon={IconTrendingUp}
              label="Conversion lift"
              trend="Weighted content signal"
              value={`+${stats.avgLift}%`}
            />
            <KpiCard
              chart="bar"
              data={[4, 5, 6, 7, stats.clientAssets]}
              icon={IconBriefcase}
              label="Client proof"
              trend="Sales enablement assets"
              value={String(stats.clientAssets)}
            />
            <KpiCard
              data={[68, 74, 82, 88, stats.avgQuality]}
              icon={IconShieldCheck}
              label="Proof quality"
              trend={`${stats.refresh} refresh due`}
              value={`${stats.avgQuality}%`}
            />
          </section>

          <SectionDivider />

          <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)]">
            <ContentObservability assets={assets} />
            <ContentCommandPanel
              asset={selected}
              onAdvance={selected ? () => advanceAsset(selected) : undefined}
              onArchive={selected ? () => setConfirmAsset(selected) : undefined}
              onEdit={selected ? () => setEditAsset(selected) : undefined}
              onInspect={selected ? () => setDrawerAsset(selected) : undefined}
            />
          </section>

          <SectionDivider />

          <section className="grid gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <SectionHeader
                eyebrow="Publishing queue"
                title="Proof and publishing workflow"
                description="Move proof assets from idea to published while tying every claim to clients, developers, outcomes, and the public Andishi promise."
              />
              <ContentToolbar
                query={query}
                setQuery={setQuery}
                setSortKey={setSortKey}
                setStatusFilter={setStatusFilter}
                setTypeFilter={setTypeFilter}
                sortKey={sortKey}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
              />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {filtered.map((asset) => (
                <ContentCard
                  asset={asset}
                  key={asset.id}
                  selected={selected?.id === asset.id}
                  onAdvance={() => advanceAsset(asset)}
                  onArchive={() => setConfirmAsset(asset)}
                  onEdit={() => setEditAsset(asset)}
                  onInspect={() => setDrawerAsset(asset)}
                  onSelect={() => setSelectedId(asset.id)}
                />
              ))}
              {!filtered.length && (
                <EmptyState
                  title="No content assets match"
                  body="Clear filters or create a proof asset."
                />
              )}
            </div>
          </section>

          <SectionDivider />

          <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
            <ChartPanel
              title="Proof lift"
              description="Conversion signal from proof assets across the content system."
              value={`+${stats.avgLift}% avg`}
            >
              <DashboardLineChart
                data={[6, 8, 11, 12, 15, stats.avgLift]}
                height={300}
                labels={["Jan", "Feb", "Mar", "Apr", "May", "Now"]}
                variant="area"
              />
            </ChartPanel>
            <ChartPanel
              title="Asset mix"
              description="Publishing queue distribution by content type."
              value={`${assets.length} assets`}
            >
              <DashboardDonutChart
                data={(Object.keys(typeLabel) as ContentType[]).map((type) => ({
                  label: typeLabel[type],
                  value: assets.filter((asset) => asset.type === type).length,
                  tone:
                    type === "case_study"
                      ? ("primary" as const)
                      : type === "engineer_story"
                        ? ("secondary" as const)
                        : type === "proof_asset"
                          ? ("success" as const)
                          : ("muted" as const),
                }))}
                height={210}
              />
            </ChartPanel>
          </section>

          <OperationalDataTable
            columns={columns}
            description="Proof ledger tying content assets to client outcomes, developer credibility, ownership, quality, and conversion impact."
            empty="No content assets match."
            onRowSelect={(asset) => {
              setSelectedId(asset.id);
              setDrawerAsset(asset);
            }}
            rows={filtered}
            title="Content proof matrix"
          />

          <CreateContentModal
            onClose={() => setCreateOpen(false)}
            onSubmit={createAsset}
            open={createOpen}
          />
          <EditContentModal
            asset={editAsset}
            onClose={() => setEditAsset(null)}
            onSubmit={updateAsset}
          />

          <EntityDrawer
            onClose={() => setDrawerAsset(null)}
            open={Boolean(drawerAsset)}
            title={drawerAsset?.title ?? "Content details"}
          >
            {drawerAsset && (
              <ContentDrawer
                asset={drawerAsset}
                onAdvance={() => advanceAsset(drawerAsset)}
                onArchive={() => setConfirmAsset(drawerAsset)}
                onEdit={() => setEditAsset(drawerAsset)}
              />
            )}
          </EntityDrawer>

          <ConfirmDialog
            confirmLabel="Archive asset"
            description={`This removes ${confirmAsset?.title ?? "this asset"} from the active publishing queue while preserving future audit trail shape.`}
            onCancel={() => setConfirmAsset(null)}
            onConfirm={archiveAsset}
            open={Boolean(confirmAsset)}
            title="Archive content asset?"
          />
        </>
      ) : (
        <>
          {/* Blogs Dashboard KPI row */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 animate-fade-in">
            <KpiCard
              chart="bar"
              data={[2, 3, 4, 4, blogStats.total]}
              icon={IconBook}
              label="Total Posts"
              trend="Live from database"
              value={String(blogStats.total)}
            />
            <KpiCard
              data={[1, 2, 3, 3, blogStats.published]}
              icon={IconCheck}
              label="Published Articles"
              trend="Live on public /blog"
              value={String(blogStats.published)}
            />
            <KpiCard
              chart="bar"
              data={[1, 1, 2, 2, blogStats.featured]}
              icon={IconStar}
              label="Featured Posts"
              trend="Highlight on homepage"
              value={String(blogStats.featured)}
            />
            <KpiCard
              data={[4, 5, 5, 5, blogStats.avgRead]}
              icon={IconClock}
              label="Avg Read Time"
              trend="Minutes per article"
              value={`${blogStats.avgRead} min`}
            />
          </section>

          <SectionDivider />

          {/* Blogs Filters & Toolbar */}
          <section className="grid gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <SectionHeader
                eyebrow="Editorial Pipeline"
                title="Manage Blog Articles"
                description="Create, edit, archive, and feature editorial content for the public Andishi talent blog."
              />
              <div className="flex flex-wrap gap-2 xl:w-auto xl:min-w-[36rem]">
                <label className="relative flex-1 min-w-[200px]">
                  <span className="sr-only">Search blog articles</span>
                  <IconSearch
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
                    size={16}
                    stroke={1.7}
                  />
                  <input
                    className="h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.84rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
                    onChange={(e) => setBlogSearch(e.target.value)}
                    placeholder="Search by title, author..."
                    value={blogSearch}
                  />
                </label>
                <div className="flex gap-2">
                  <SelectPill
                    icon={IconFilter}
                    label="Category"
                    value={blogCategoryFilter}
                    onChange={(value) => setBlogCategoryFilter(value)}
                  >
                    <option value="all">All categories</option>
                    <option value="Hiring">Hiring</option>
                    <option value="African Tech">African Tech</option>
                    <option value="Remote Work">Remote Work</option>
                    <option value="Engineering">Engineering</option>
                  </SelectPill>
                  <SelectPill
                    icon={IconCheck}
                    label="Status"
                    value={blogStatusFilter}
                    onChange={(value) => setBlogStatusFilter(value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </SelectPill>
                </div>
              </div>
            </div>

            {/* Operational Data Table */}
            <OperationalDataTable
              columns={blogColumns}
              description="Blogs register containing post tags, publication status, featured flag, and author metadata."
              empty={blogLoading ? "Loading blog posts…" : "No blog posts match."}
              onRowSelect={(post) => {
                handleEditBlog(post);
              }}
              rows={blogRows}
              title="Blog Post Index"
            />
          </section>

          {/* Form edit modal dialog for blogs */}
          <BlogEditModal
            post={editingBlogPost}
            isNew={isNewBlog}
            onClose={() => {
              setEditingBlogPost(null);
            }}
            onSubmit={saveBlogForm}
          />

          <ConfirmDialog
            confirmLabel={isDeletingBlog ? "Deleting…" : "Delete article"}
            description={`This permanently deletes the article "${blogPostsState.find((p) => p.slug === blogToDelete)?.title || ""}" and removes it from the public blog.`}
            onCancel={() => setDeleteBlogConfirmOpen(false)}
            onConfirm={confirmDeleteBlog}
            open={deleteBlogConfirmOpen}
            title="Delete blog post?"
          />
        </>
      )}
    </div>
  );
}

function ContentObservability({ assets }: { assets: ContentAsset[] }) {
  const stageCounts = statusOrder.map(
    (status) => assets.filter((asset) => asset.status === status).length,
  );
  return (
    <div className="min-w-0">
      <SectionHeader
        eyebrow="Proof observability"
        title="Marketing truth pipeline"
        description="Each content asset must prove one Andishi promise: seniority, speed, technical vetting, onboarding support, guarantee, or measurable shipping outcome."
      />
      <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-h-[27rem] rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
          <DashboardBarChart
            data={stageCounts}
            height={330}
            labels={statusOrder.map((status) => statusMeta[status].label)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-1">
          <ContextTile icon={IconClock} label="48-hour matching" value="Guides and proof blocks" />
          <ContextTile icon={IconUsers} label="Senior network" value="Engineer stories" />
          <ContextTile icon={IconShieldCheck} label="Guarantee" value="Post-placement proof" />
        </div>
      </div>
    </div>
  );
}

function ContentToolbar({
  query,
  setQuery,
  setSortKey,
  setStatusFilter,
  setTypeFilter,
  sortKey,
  statusFilter,
  typeFilter,
}: {
  query: string;
  setQuery: (value: string) => void;
  setSortKey: (value: SortKey) => void;
  setStatusFilter: (value: ContentStatus | "all") => void;
  setTypeFilter: (value: ContentType | "all") => void;
  sortKey: SortKey;
  statusFilter: ContentStatus | "all";
  typeFilter: ContentType | "all";
}) {
  return (
    <div className="grid w-full gap-3 xl:w-auto xl:min-w-[44rem]">
      <label className="relative min-w-0">
        <span className="sr-only">Search content assets</span>
        <IconSearch
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
          size={16}
          stroke={1.7}
        />
        <input
          className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search assets, proof signals, clients, developers..."
          value={query}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        <SelectPill
          icon={IconFilter}
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as ContentStatus | "all")}
        >
          <option value="all">All statuses</option>
          {statusOrder.map((status) => (
            <option key={status} value={status}>
              {statusMeta[status].label}
            </option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconFileText}
          label="Type"
          value={typeFilter}
          onChange={(value) => setTypeFilter(value as ContentType | "all")}
        >
          <option value="all">All types</option>
          {(Object.keys(typeLabel) as ContentType[]).map((type) => (
            <option key={type} value={type}>
              {typeLabel[type]}
            </option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconTrendingUp}
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
        >
          <option value="impact">Impact</option>
          <option value="freshness">Refresh risk</option>
          <option value="pipeline">Quality</option>
          <option value="status">Status</option>
        </SelectPill>
      </div>
    </div>
  );
}

function ContentCard({
  asset,
  onAdvance,
  onArchive,
  onEdit,
  onInspect,
  onSelect,
  selected,
}: {
  asset: ContentAsset;
  onAdvance: () => void;
  onArchive: () => void;
  onEdit: () => void;
  onInspect: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200",
        selected
          ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]"
          : asset.status === "refresh"
            ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--error)_5%,var(--surface)),var(--surface))]"
            : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_24%,var(--surface)),var(--surface))]",
      )}
    >
      <button
        className="block w-full cursor-pointer p-5 text-left sm:p-6"
        onClick={onSelect}
        type="button"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-[1rem] font-medium text-[var(--on-surface)]">
            {asset.title}
          </h3>
          <StatusBadge
            label={statusMeta[asset.status].label}
            tone={statusMeta[asset.status].tone}
          />
        </div>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
          {asset.summary}
        </p>
        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <SignalCell label="Quality" value={`${asset.quality}%`} />
          <SignalCell label="Lift" value={`+${asset.conversionLift}%`} />
          <SignalCell label="Due" value={asset.dueDate} />
        </div>
        <p className="mt-5 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
          Proof: {asset.proofSignal}
        </p>
      </button>
      <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate text-[0.82rem] text-[var(--on-surface-dim)]">
          {asset.linkedClient} / {asset.linkedDeveloper}
        </span>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <IconButton label="Edit" onClick={onEdit}>
            <IconEdit size={16} stroke={1.8} />
          </IconButton>
          <IconButton label="Inspect" onClick={onInspect}>
            <IconArrowRight size={16} stroke={1.8} />
          </IconButton>
          <IconButton label="Advance" onClick={onAdvance}>
            <IconCheck size={16} stroke={1.8} />
          </IconButton>
          <IconButton danger label="Archive" onClick={onArchive}>
            <IconTrash size={16} stroke={1.8} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

function ContentCommandPanel({
  asset,
  onAdvance,
  onArchive,
  onEdit,
  onInspect,
}: {
  asset: ContentAsset | null;
  onAdvance?: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onInspect?: () => void;
}) {
  if (!asset)
    return (
      <EmptyState title="Select an asset" body="Pick a content asset to inspect proof context." />
    );
  return (
    <aside className="2xl:sticky 2xl:top-28 2xl:self-start">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6">
        <StatusBadge label={statusMeta[asset.status].label} tone={statusMeta[asset.status].tone} />
        <h2 className="title-serif mt-3 text-[1.15rem] font-medium text-[var(--on-surface)]">
          {asset.title}
        </h2>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
          {asset.proofSignal}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <InfoTile label="Owner" value={asset.owner} />
          <InfoTile label="Audience" value={asset.audience} />
          <InfoTile label="Quality" value={`${asset.quality}%`} />
          <InfoTile label="Lift" value={`+${asset.conversionLift}%`} />
        </div>
        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Risk</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            {asset.risk}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <ActionButton icon={IconEdit} label="Edit" onClick={onEdit} />
          <ActionButton icon={IconEye} label="Inspect" onClick={onInspect} />
          <ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} />
          <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        </div>
      </div>
    </aside>
  );
}

function ContentDrawer({
  asset,
  onAdvance,
  onArchive,
  onEdit,
}: {
  asset: ContentAsset;
  onAdvance: () => void;
  onArchive: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="grid gap-6">
      <section>
        <StatusBadge label={statusMeta[asset.status].label} tone={statusMeta[asset.status].tone} />
        <h3 className="mt-3 text-[1.35rem] font-medium text-[var(--on-surface)]">{asset.title}</h3>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
          {asset.summary}
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoTile label="Target" value={asset.publishTarget} />
        <InfoTile label="Channel" value={asset.channel} />
        <InfoTile label="Client" value={asset.linkedClient} />
        <InfoTile label="Developer" value={asset.linkedDeveloper} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Proof signal</p>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
            {asset.proofSignal}
          </p>
          <p className="mt-4 text-[0.82rem] leading-relaxed text-[var(--error)]">{asset.risk}</p>
        </div>
        <ActivityPanel activity={asset.activity} />
      </section>
      <div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end">
        <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        <ActionButton icon={IconEdit} label="Edit" onClick={onEdit} />
        <ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} />
      </div>
    </div>
  );
}

function CreateContentModal({
  onClose,
  onSubmit,
  open,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    type: ContentType;
    linkedClient: string;
    proofSignal: string;
  }) => void;
  open: boolean;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(open, onClose, firstInputRef);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      title: String(form.get("title") || "New proof asset"),
      type: String(form.get("type") || "case_study") as ContentType,
      linkedClient: String(form.get("linkedClient") || "Pipeline"),
      proofSignal: String(form.get("proofSignal") || "Proof signal"),
    });
  };
  return (
    <ModalShell labelledBy="create-content-title" onClose={onClose}>
      <form
        className="w-full max-w-3xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6"
        onSubmit={submit}
      >
        <ModalHeader
          eyebrow="Proof intake"
          id="create-content-title"
          onClose={onClose}
          title="Create content asset"
        />
        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2">
          <FormInput
            ref={firstInputRef}
            label="Title"
            name="title"
            placeholder="AI engineer hiring guide"
          />
          <FormInput label="Linked client" name="linkedClient" placeholder="Kijani Analytics" />
          <FormInput
            label="Proof signal"
            name="proofSignal"
            placeholder="48-hour matched profiles"
          />
          <SelectField label="Type" name="type" options={Object.keys(typeLabel)} />
        </div>
        <ModalActions onClose={onClose} submitLabel="Create asset" />
      </form>
    </ModalShell>
  );
}

function EditContentModal({
  asset,
  onClose,
  onSubmit,
}: {
  asset: ContentAsset | null;
  onClose: () => void;
  onSubmit: (
    asset: ContentAsset,
    patch: Pick<
      ContentAsset,
      "owner" | "proofSignal" | "publishTarget" | "quality" | "risk" | "summary" | "title"
    >,
  ) => void;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(Boolean(asset), onClose, firstInputRef);
  if (!asset) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit(asset, {
      owner: String(form.get("owner") || asset.owner),
      proofSignal: String(form.get("proofSignal") || asset.proofSignal),
      publishTarget: String(form.get("publishTarget") || asset.publishTarget),
      quality: Number(form.get("quality") || asset.quality),
      risk: String(form.get("risk") || asset.risk),
      summary: String(form.get("summary") || asset.summary),
      title: String(form.get("title") || asset.title),
    });
  };
  return (
    <ModalShell labelledBy="edit-content-title" onClose={onClose}>
      <form
        className="w-full max-w-4xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6"
        onSubmit={submit}
      >
        <ModalHeader
          eyebrow="Proof editor"
          id="edit-content-title"
          onClose={onClose}
          title={`Edit ${asset.title}`}
        />
        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2">
          <FormInput ref={firstInputRef} label="Title" name="title" placeholder={asset.title} />
          <FormInput label="Owner" name="owner" placeholder={asset.owner} />
          <FormInput
            label="Publish target"
            name="publishTarget"
            placeholder={asset.publishTarget}
          />
          <FormInput label="Quality score" name="quality" placeholder={String(asset.quality)} />
          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Proof signal
            </span>
            <textarea
              className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              defaultValue={asset.proofSignal}
              name="proofSignal"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Summary</span>
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              defaultValue={asset.summary}
              name="summary"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Proof risk</span>
            <textarea
              className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              defaultValue={asset.risk}
              name="risk"
            />
          </label>
        </div>
        <ModalActions onClose={onClose} submitLabel="Update asset" />
      </form>
    </ModalShell>
  );
}

function buildContentStats(assets: ContentAsset[]) {
  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  return {
    avgLift: avg(assets.map((asset) => asset.conversionLift)),
    avgQuality: avg(assets.map((asset) => asset.quality)),
    clientAssets: assets.filter((asset) => asset.audience === "client").length,
    published: assets.filter((asset) => asset.status === "published").length,
    refresh: assets.filter((asset) => asset.status === "refresh").length,
    review: assets.filter((asset) => asset.status === "review").length,
    total: assets.length,
  };
}

function ContextTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <article className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <Icon className="text-[var(--primary)]" size={19} stroke={1.7} />
      <p className="mt-3 text-[0.9rem] font-medium text-[var(--on-surface)]">{label}</p>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p>
    </article>
  );
}

function SectionHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="label-caps text-[var(--primary)]">{eyebrow}</p>
      <h2 className="title-serif mt-3 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
        {description}
      </p>
    </div>
  );
}

function ChartPanel({
  children,
  description,
  title,
  value,
}: {
  children: ReactNode;
  description: string;
  title: string;
  value: string;
}) {
  return (
    <article className="min-w-0 rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
      <div className="flex min-h-[4.75rem] items-start justify-between gap-4">
        <div>
          <h3 className="text-[1rem] font-medium text-[var(--on-surface)]">{title}</h3>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">
          {value}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function SelectPill({
  children,
  icon: Icon,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  icon: Icon;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
        size={15}
        stroke={1.7}
      />
      <select
        className="h-10 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-9 pr-8 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function IconButton({
  children,
  danger,
  label,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid h-9 w-9 cursor-pointer place-items-center rounded-full border transition-colors duration-200",
        danger
          ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ActionButton({
  danger,
  icon: Icon,
  label,
  onClick,
}: {
  danger?: boolean;
  icon: Icon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 text-[0.82rem] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        danger
          ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          : "border-[var(--glass-border)] text-[var(--on-surface)] hover:bg-[var(--glass-bg)]",
      )}
      disabled={!onClick}
      onClick={onClick}
      type="button"
    >
      <Icon size={15} stroke={1.7} />
      {label}
    </button>
  );
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--glass-border)] px-3 py-3 last:border-r-0">
      <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[0.84rem] text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5">
      <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[0.82rem] text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function ActivityPanel({ activity }: { activity: string[] }) {
  return (
    <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Activity</p>
      <div className="mt-4 grid gap-3">
        {activity.map((item, index) => (
          <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3" key={`${item}-${index}`}>
            <span
              className={cn(
                "mt-1 h-2 w-2 rounded-full",
                index === 0 ? "bg-[var(--tertiary)]" : "bg-[var(--on-surface-dim)]",
              )}
            />
            <p className="text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalShell({
  children,
  labelledBy,
  onClose,
}: {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
}) {
  return (
    <div
      aria-labelledby={labelledBy}
      aria-modal="true"
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      {children}
    </div>
  );
}

function ModalHeader({
  eyebrow,
  id,
  onClose,
  title,
}: {
  eyebrow: string;
  id: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="label-caps text-[var(--primary)]">{eyebrow}</p>
        <h2
          id={id}
          className="title-serif mt-2 text-[1.25rem] font-medium text-[var(--on-surface)]"
        >
          {title}
        </h2>
      </div>
      <button
        aria-label="Close modal"
        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
        onClick={onClose}
        type="button"
      >
        <IconX size={18} stroke={1.7} />
      </button>
    </div>
  );
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]"
        onClick={onClose}
        type="button"
      >
        Cancel
      </button>
      <button
        className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]"
        type="submit"
      >
        {submitLabel}
      </button>
    </div>
  );
}

const FormInput = forwardRef<
  HTMLInputElement,
  { label: string; name: string; placeholder: string }
>(function FormInput({ label, name, placeholder }, ref) {
  return (
    <label>
      <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span>
      <input
        ref={ref}
        className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
});

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label>
      <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span>
      <select
        className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
        name={name}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center lg:col-span-2">
      <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
        {body}
      </p>
    </div>
  );
}

function useModalLifecycle<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  ref: React.RefObject<T | null>,
) {
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open, ref]);
}

function BlogEditModal({
  post,
  isNew,
  onClose,
  onSubmit,
}: {
  post: BlogPost | null;
  isNew: boolean;
  onClose: () => void;
  onSubmit: (post: BlogPost) => void;
}) {
  const [formData, setFormData] = useState<BlogPost>(() => {
    if (post) return { ...post };
    return {
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
      body: "First paragraph...\n\nSecond paragraph...",
      status: "published",
    };
  });

  // Resync formData when the edited post identity changes (e.g. switching
  // which post is open while the modal stays mounted) - adjusted during
  // render per React's guidance, rather than via an Effect, since this is
  // just following a prop change, not synchronizing with an external system.
  const [syncedPost, setSyncedPost] = useState(post);
  if (post !== syncedPost) {
    setSyncedPost(post);
    if (post) setFormData({ ...post });
  }

  if (!post) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const payload = isNew
      ? {
          ...formData,
          slug: formData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-"),
        }
      : formData;
    onSubmit(payload);
  };

  return (
    <ModalShell labelledBy="blog-edit-title" onClose={onClose}>
      <form
        className="w-full max-w-4xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6 max-h-[90vh] overflow-y-auto"
        onSubmit={submit}
      >
        <ModalHeader
          eyebrow="Editorial Desk"
          id="blog-edit-title"
          onClose={onClose}
          title={isNew ? "Create Blog Post" : `Edit ${formData.title}`}
        />

        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2 text-left">
          <label>
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Title</span>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
              placeholder="Article title"
              required
            />
          </label>

          <label>
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Category</span>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as BlogPost["category"] })
              }
              className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
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
          </label>

          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Excerpt Summary
            </span>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              placeholder="A short summary of the article..."
              required
            />
          </label>

          <label>
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Cover Image URL
            </span>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              placeholder="/images/blog-image-1.jpg"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Read Time</span>
              <input
                type="number"
                value={formData.readTime}
                onChange={(e) =>
                  setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })
                }
                className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                min={1}
              />
            </label>

            <label>
              <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Status</span>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as BlogPost["status"] })
                }
                className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              >
                <option value="published" className="bg-[var(--surface)] text-[var(--on-surface)]">
                  Published
                </option>
                <option value="draft" className="bg-[var(--surface)] text-[var(--on-surface)]">
                  Draft
                </option>
                <option value="archived" className="bg-[var(--surface)] text-[var(--on-surface)]">
                  Archived
                </option>
              </select>
            </label>
          </div>

          <div className="sm:col-span-2 border-t border-[var(--glass-border)] pt-4 mt-2">
            <p className="text-[0.8rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-3">
              Author Details
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="text-[0.72rem] text-[var(--on-surface-dim)]">Name</span>
                <input
                  type="text"
                  value={formData.author.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      author: { ...formData.author, name: e.target.value },
                    })
                  }
                  className="mt-1.5 h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.82rem] focus:outline-none"
                  required
                />
              </label>
              <label>
                <span className="text-[0.72rem] text-[var(--on-surface-dim)]">Role</span>
                <input
                  type="text"
                  value={formData.author.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      author: { ...formData.author, role: e.target.value },
                    })
                  }
                  className="mt-1.5 h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.82rem] focus:outline-none"
                  required
                />
              </label>
              <label>
                <span className="text-[0.72rem] text-[var(--on-surface-dim)]">Avatar URL</span>
                <input
                  type="text"
                  value={formData.author.avatarUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      author: { ...formData.author, avatarUrl: e.target.value },
                    })
                  }
                  className="mt-1.5 h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.82rem] focus:outline-none"
                />
              </label>
            </div>
          </div>

          <label className="sm:col-span-2 border-t border-[var(--glass-border)] pt-4 mt-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Featured</span>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-[var(--glass-border)] bg-transparent text-[var(--primary)] focus:ring-[var(--primary)]"
                id="blog-featured-checkbox"
              />
              <span className="text-[0.82rem] text-[var(--on-surface-dim)]">
                Show this post featured on homepage grid
              </span>
            </div>
          </label>

          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Body (Markdown)
            </span>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] leading-relaxed"
              placeholder="Article body content in Markdown..."
              required
            />
          </label>
        </div>

        <ModalActions onClose={onClose} submitLabel={isNew ? "Create Post" : "Save Changes"} />
      </form>
    </ModalShell>
  );
}
