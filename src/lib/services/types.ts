import type { SessionContext } from "@/lib/auth/session";

/**
 * Every service function takes a CallerContext as its first argument.
 * Services authorize via lib/authz (can/authorize) and ownership scoping,
 * run multi-table writes inside db.transaction(), and write audit/activity
 * records themselves - route handlers stay limited to auth, parsing, and
 * response shaping (see src/app/api/briefs/route.ts and
 * src/app/api/projects/route.ts for the reference pattern).
 */
export interface CallerContext {
  session: SessionContext;
  requestId: string;
  actorIp?: string;
}
