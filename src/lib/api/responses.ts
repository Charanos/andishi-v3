import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError, isDomainError } from "@/lib/authz/errors";
import { captureException } from "@/lib/observability/capture";

export function jsonError(error: string, status = 400, field?: string, code?: string) {
  return NextResponse.json(
    { error, ...(field ? { field } : {}), ...(code ? { code } : {}) },
    { status },
  );
}

export function validationError(error: ZodError) {
  const issue = error.issues[0];
  return jsonError(issue?.message ?? "Invalid request.", 400, issue?.path.join("."), "VALIDATION");
}

export async function parseJson(req: Request) {
  return req.json().catch(() => null);
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function errorFromDomainError(error: DomainError, requestId?: string) {
  return NextResponse.json(
    {
      error: error.message,
      ...(error.field ? { field: error.field } : {}),
      code: error.code,
      ...(requestId ? { requestId } : {}),
    },
    { status: error.status },
  );
}

export interface RouteErrorContext {
  requestId: string;
  actorUserId?: string;
  module?: string;
  action?: string;
}

/**
 * Single catch-all for route handler try/catch blocks. Domain errors and
 * Zod validation errors map to their proper status codes; anything else is
 * reported to Sentry (via captureException) and returned as a generic 500
 * carrying the request ID so it can be correlated with the Sentry event and
 * server logs.
 */
export function handleRouteError(error: unknown, context: RouteErrorContext) {
  if (error instanceof ZodError) return validationError(error);
  if (isDomainError(error)) return errorFromDomainError(error, context.requestId);

  captureException(error, context);

  return NextResponse.json(
    {
      error: "Something went wrong. Please try again.",
      code: "INTERNAL",
      requestId: context.requestId,
    },
    { status: 500 },
  );
}

// ── Pagination ──────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

export function parsePagination(
  searchParams: URLSearchParams,
  opts?: { defaultPageSize?: number; maxPageSize?: number },
): PaginationParams {
  const defaultPageSize = opts?.defaultPageSize ?? 25;
  const maxPageSize = opts?.maxPageSize ?? 100;

  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawPageSize =
    Number.parseInt(searchParams.get("pageSize") ?? String(defaultPageSize), 10) || defaultPageSize;
  const pageSize = Math.min(Math.max(1, rawPageSize), maxPageSize);

  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function paginated<T>(data: T[], pagination: PaginationParams, total: number) {
  return NextResponse.json({ data, page: pagination.page, pageSize: pagination.pageSize, total });
}
