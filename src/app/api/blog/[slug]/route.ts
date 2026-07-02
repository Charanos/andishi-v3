import { NextResponse } from "next/server";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { getPublicBlogPostBySlug } from "@/lib/services/cms/blog";

/** GET /api/blog/[slug] - public detail for a single published post. */
export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const requestId = generateRequestId();
  const { slug } = await context.params;

  try {
    const post = await getPublicBlogPostBySlug(slug);
    if (!post) return jsonError("Blog post not found.", 404);
    return NextResponse.json({ post });
  } catch (error) {
    return handleRouteError(error, { requestId, module: "cms", action: "blog.read" });
  }
}
