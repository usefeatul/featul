// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { dataCollection } from "./src/lib/sentry";

Sentry.init({
  dsn: "https://556e2890d3864557b454c237ffc80638@o4510728807055360.ingest.de.sentry.io/4510728808759376",

  // Keep check-ins in the existing monitor environment after the SDK upgrade.
  environment:
    process.env.SENTRY_ENVIRONMENT ||
    (process.env.VERCEL_ENV ? `vercel-${process.env.VERCEL_ENV}` : process.env.NODE_ENV),

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Preserve the restrictive v10 collection policy after the v11 upgrade.
  dataCollection,
});
