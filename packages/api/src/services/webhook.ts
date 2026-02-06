import type { IntegrationType } from "../validators/integration"
import { isIntegrationsAllowed } from "../shared/plan"

/**
 * Post data structure for webhook notifications
 */
interface PostNotificationData {
  id: string
  title: string
  content: string
  slug: string
  boardName: string
  boardSlug: string
  workspaceName: string
  workspaceSlug: string
  authorName?: string
  status?: string
  image?: string | null
  createdAt: Date
}

/**
 * Send a Discord webhook notification for a new post
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  post: PostNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const postUrl = `https://${post.workspaceSlug}.featul.com/board/p/${post.slug}`

    const embed = {
      author: {
        name: "New Feedback Submission",
      },
      title: post.title,
      url: postUrl,
      color: 5814783, // Featul brand color (hex: #58b0ff)
      description: post.content.length > 300
        ? `${post.content.substring(0, 300)}...`
        : post.content,
      ...(post.image ? { thumbnail: { url: post.image } } : {}),
      fields: [
        {
          name: "Board",
          value: `**${post.boardName}**`,
          inline: true,
        },
        {
          name: "Status",
          value: `**${post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : "Pending"}**`,
          inline: true,
        },
        {
          name: "Submitted by",
          value: `**${post.authorName || "Anonymous"}**`,
          inline: true,
        },
      ],
      timestamp: post.createdAt.toISOString(),
      footer: {
        text: `${post.workspaceName} • Powered by Featul`,
      },
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `Discord API error: ${errorText}` }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/**
 * Send a Slack webhook notification for a new post
 */
export async function sendSlackNotification(
  webhookUrl: string,
  post: PostNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const postUrl = `https://${post.workspaceSlug}.featul.com/board/p/${post.slug}`

    const payload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🆕 New Feedback Submission",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${postUrl}|${post.title}>*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*Board:* ${post.boardName}`,
            },
            {
              type: "mrkdwn",
              text: `*Status:* ${post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : "Pending"}`,
            },
            {
              type: "mrkdwn",
              text: `*Submitted by:* ${post.authorName || "Anonymous"}`,
            },
          ],
        },
        {
          type: "divider",
        },
        ...(post.image ? [{
          type: "image",
          image_url: post.image,
          alt_text: post.title,
        }] : []),
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `${post.workspaceName} • Powered by Featul`,
            },
          ],
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `Slack API error: ${errorText}` }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/**
 * Send notification to the appropriate webhook based on type
 */
export async function sendWebhookNotification(
  type: IntegrationType,
  webhookUrl: string,
  post: PostNotificationData
): Promise<{ success: boolean; error?: string }> {
  switch (type) {
    case "discord":
      return sendDiscordNotification(webhookUrl, post)
    case "slack":
      return sendSlackNotification(webhookUrl, post)
    default:
      return { success: false, error: `Unsupported integration type: ${type}` }
  }
}

/**
 * Send a test notification to verify webhook is working
 */
export async function sendTestNotification(
  type: IntegrationType,
  webhookUrl: string,
  workspaceName: string
): Promise<{ success: boolean; error?: string }> {
  const testPost: PostNotificationData = {
    id: "test-post-id",
    title: "Test Notification",
    content: "This is a test notification from Featul to verify your webhook integration is working correctly.",
    slug: "test-notification",
    boardName: "Test Board",
    boardSlug: "test-board",
    workspaceName,
    workspaceSlug: "test",
    authorName: "Featul Bot",
    createdAt: new Date(),
  }

  return sendWebhookNotification(type, webhookUrl, testPost)
}

/**
 * Trigger webhooks for a new post submission
 * This is called from the post creation endpoint
 */
export async function triggerPostWebhooks(
  db: any,
  workspaceId: string,
  post: PostNotificationData
): Promise<void> {
  try {
    // Import here to avoid circular dependency issues
    const { workspace, workspaceIntegration } = await import("@featul/db")
    const { eq } = await import("drizzle-orm")

    const [ws] = await db
      .select({ plan: workspace.plan })
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1)

    if (!ws) {
      return
    }

    const plan = ws.plan ?? "free"
    if (!isIntegrationsAllowed(plan)) {
      return
    }

    // Get all active integrations for the workspace
    const integrations = await db
      .select({
        id: workspaceIntegration.id,
        type: workspaceIntegration.type,
        webhookUrl: workspaceIntegration.webhookUrl,
      })
      .from(workspaceIntegration)
      .where(eq(workspaceIntegration.workspaceId, workspaceId))

    // Send notifications to all active integrations (fire and forget)
    for (const integration of integrations) {
      sendWebhookNotification(
        integration.type as IntegrationType,
        integration.webhookUrl,
        post
      ).then(async (result) => {
        // Update last triggered timestamp
        await db
          .update(workspaceIntegration)
          .set({ lastTriggeredAt: new Date() })
          .where(eq(workspaceIntegration.id, integration.id))

        if (!result.success) {
          console.error(`Webhook notification failed for ${integration.type}:`, result.error)
        }
      }).catch((error) => {
        console.error(`Webhook notification error for ${integration.type}:`, error)
      })
    }
  } catch (error) {
    console.error("Error triggering webhooks:", error)
  }
}

export type { PostNotificationData }
