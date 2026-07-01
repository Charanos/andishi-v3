import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/observability/logger";

let redis: Redis | null = null;
let warnedOnce = false;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!redis) redis = new Redis({ url, token });
  return redis;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const limiters = new Map<string, Ratelimit>();

/**
 * Sliding-window rate limit keyed by (bucket, identifier) - e.g.
 * rateLimit("login", clientIp, { limit: 10, windowSeconds: 300 }).
 *
 * Fails open (allows the request) when UPSTASH_REDIS_REST_URL/TOKEN aren't
 * set, logging a one-time warning - safe to ship ahead of provisioning an
 * Upstash database, same pattern as the Sentry DSN being optional (see
 * ADR-0008). Once the env vars are set, limits activate with no code
 * change.
 */
export async function rateLimit(
  bucket: string,
  identifier: string,
  opts: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const client = getRedis();

  if (!client) {
    if (!warnedOnce) {
      logger.warn(
        "Rate limiting inactive - UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set",
      );
      warnedOnce = true;
    }
    return {
      allowed: true,
      remaining: opts.limit,
      resetAt: Date.now() + opts.windowSeconds * 1000,
    };
  }

  const cacheKey = `${bucket}:${opts.limit}:${opts.windowSeconds}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowSeconds} s`),
      prefix: `andishi:ratelimit:${bucket}`,
    });
    limiters.set(cacheKey, limiter);
  }

  const result = await limiter.limit(identifier);
  return { allowed: result.success, remaining: result.remaining, resetAt: result.reset };
}
