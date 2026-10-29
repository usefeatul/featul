import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { neon, neonConfig } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your environment (e.g., apps/feed/.env.local)",
  );
}

// Self-hosted Postgres sits behind a Neon HTTP proxy (see selfhost/docker-compose.yml),
// so queries keep the same driver, batches, and transactions as Neon itself.
const DATABASE_HTTP_ENDPOINT = process.env.DATABASE_HTTP_ENDPOINT?.trim();
if (DATABASE_HTTP_ENDPOINT) {
  neonConfig.fetchEndpoint = DATABASE_HTTP_ENDPOINT;
}

export const db = drizzle(neon(DATABASE_URL), { schema });
export const {
  user,
  session,
  account,
  verification,
  passkeyTable,
  twoFactorTable,
  workspace,
  workspaceDomain,
  workspaceMember,
  workspaceInvite,
  widgetUser,
  board,
  post,
  tag,
  postTag,
  postUpdate,
  postReport,
  postMerge,
  comment,
  commentReaction,
  commentEmojiReaction,
  commentMention,
  commentReport,
  vote,
  subscription,
  billingNotification,
  billingState,
  billingAccount,
  billingEvent,
  brandingConfig,
  workspaceSlugReservation,
  changelogEntry,
  changelogAiConversation,
  changelogMention,
  changelogSubscription,
  helpCenter,
  helpCollection,
  helpArticle,
  helpArticleDaily,
  helpSearchDaily,
  activityLog,
  workspaceIntegration,
  workspaceNotraConnection,
  webhookDelivery,
  workspaceApiKey,
  githubIssueLink,
  githubSyncSettings,
} = schema;
