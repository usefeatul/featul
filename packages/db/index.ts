import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your environment (e.g., apps/feed/.env.local)")
}

export const db = drizzle(neon(DATABASE_URL), { schema })
export const {
  user,
  session,
  account,
  verification,
  workspace,
  workspaceDomain,
  workspaceMember,
  workspaceInvite,
  board,
  post,
  tag,
  postTag,
  postUpdate,
  postReport,
  postMerge,
  comment,
  commentReaction,
  commentMention,
  commentReport,
  vote,
  subscription,
  brandingConfig,
  workspaceSlugReservation,
  changelogEntry,
  activityLog,
  workspaceIntegration,
} = schema
