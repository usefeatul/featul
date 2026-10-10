// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { dataCollection } from "./src/lib/sentry";

Sentry.init({
  dsn: "https://556e2890d3864557b454c237ffc80638@o4510728807055360.ingest.de.sentry.io/4510728808759376",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Preserve the restrictive v10 collection policy after the v11 upgrade.
  dataCollection,
});
