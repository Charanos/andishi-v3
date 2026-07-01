import type { NextRequest } from "next/server";

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") ?? undefined;
}
