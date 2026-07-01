import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 100% in development, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Attach local variable values to stack frames (server only)
  includeLocalVariables: true,

  // Deliberately false, not the SDK default - the ERP handles client PII,
  // resumes, and financial data (Part 10 of the backend architecture doc).
  // Context is attached explicitly and narrowly instead (see
  // src/lib/observability/capture.ts), not via automatic PII capture.
  sendDefaultPii: false,
});
