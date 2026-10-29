/**
 * Featul Cloud's Sentry project. Self-hosted builds set NEXT_PUBLIC_SENTRY_DSN, empty to
 * turn reporting off, so their errors never reach Featul's project.
 */
export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://556e2890d3864557b454c237ffc80638@o4510728807055360.ingest.de.sentry.io/4510728808759376";
