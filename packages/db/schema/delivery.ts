import { pgTable, text, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { post } from "./post"
import { workspaceIntegration } from "./integration"

// One durable delivery per post/integration; webhook credentials stay in the integration table.
export const webhookDelivery = pgTable("webhook_delivery", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => post.id, { onDelete: "cascade" }),
  integrationId: text("integration_id").notNull().references(() => workspaceIntegration.id, { onDelete: "cascade" }),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: timestamp("next_attempt_at").notNull().defaultNow(),
  lockToken: text("lock_token"),
  lockedUntil: timestamp("locked_until"),
  completedAt: timestamp("completed_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, table => ({
  deliveryUnique: uniqueIndex("webhook_delivery_post_integration_unique").on(table.postId, table.integrationId),
  pendingIndex: index("webhook_delivery_pending_idx").on(table.nextAttemptAt).where(sql`completed_at is null`),
}))
