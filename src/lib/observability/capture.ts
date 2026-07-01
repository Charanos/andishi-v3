import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/observability/logger";

export interface CaptureContext {
  requestId?: string;
  actorUserId?: string;
  module?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

/**
 * Reports an unexpected error to Sentry (a no-op until Sentry.init() runs -
 * see sentry.server.config.ts / instrumentation.ts) and always logs it
 * locally with the same request ID so the two can be correlated.
 */
export function captureException(error: unknown, context: CaptureContext = {}): void {
  const { requestId, actorUserId, module, action, extra } = context;

  Sentry.captureException(error, {
    tags: { requestId, module, action },
    user: actorUserId ? { id: actorUserId } : undefined,
    extra,
  });

  logger.error(error instanceof Error ? error.message : "Unhandled error", {
    requestId,
    actorUserId,
    module,
    action,
    stack: error instanceof Error ? error.stack : undefined,
    ...extra,
  });
}
