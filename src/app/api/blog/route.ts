import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { getClientIp } from "@/lib/api/request";
import { createBlogPost, listAllBlogPosts, listPublicBlogPosts } from "@/lib/services/cms/blog";
import { createBlogPostSchema } from "@/lib/validation/cms";

/**
 * GET /api/blog
 *
 * Public, unauthenticated by default: returns published posts (?category=
 * to filter). Pass ?all=true while authenticated as staff with
 * cms.blog.read to get the full management list (drafts + archived) for
 * the admin page.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);

  if (searchParams.get("all") === "true") {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    try {
      const result = await listAllBlogPosts({ session, requestId });
      return NextResponse.json({ posts: result });
    } catch (error) {
      return handleRouteError(error, {
        requestId,
        actorUserId: session.user.id,
        module: "cms",
        action: "blog.read",
      });
    }
  }

  const category = searchParams.get("category") ?? undefined;
  const result = await listPublicBlogPosts({ category });
  return NextResponse.json({ posts: result });
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createBlogPostSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const post = await createBlogPost(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "cms",
      action: "blog.write",
    });
  }
}
