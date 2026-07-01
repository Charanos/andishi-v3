/**
 * Domain errors thrown by the service layer. Route handlers map these to
 * HTTP responses via lib/api/responses.ts (errorFromDomainError). Services
 * never construct NextResponse directly - that keeps them callable from
 * background jobs and other services, not just HTTP route handlers.
 */

export type DomainErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "RATE_LIMITED";

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly status: number;
  readonly field?: string;

  constructor(code: DomainErrorCode, message: string, status: number, field?: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "You do not have permission to perform this action.") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Resource not found.") {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message = "This action conflicts with the current state.") {
    super("CONFLICT", message, 409);
  }
}

export class DomainValidationError extends DomainError {
  constructor(message: string, field?: string) {
    super("VALIDATION", message, 400, field);
  }
}

export class RateLimitedError extends DomainError {
  constructor(message = "Too many requests. Try again shortly.") {
    super("RATE_LIMITED", message, 429);
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
