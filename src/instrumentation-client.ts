import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  integrations: [
    Sentry.browserTracingIntegration({
      shouldCreateSpanForRequest: (url) => !url.match(/\/health$/),
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // 100% in development, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay: 10% of all sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  tracePropagationTargets: ["localhost", /^\//],
});

// Hook into App Router navigation transitions (App Router only)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
