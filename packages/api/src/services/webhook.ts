import type { IntegrationType } from "../validators/integration"

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
    const postUrl = `https://${post.workspaceSlug}.featul.com/${post.boardSlug}/${post.slug}`

    const embed = {
      title: "🆕 New Feedback Submission",
      color: 5814783, // Featul brand color (hex: #58b0ff)
      fields: [
        {
          name: "Title",
          value: post.title,
          inline: false,
        },
        {
          name: "Board",
          value: post.boardName,
          inline: true,
        },
        {
          name: "Submitted by",
          value: post.authorName || "Anonymous",
          inline: true,
        },
      ],
      description:
        post.content.length > 200
          ? `${post.content.substring(0, 200)}...`
          : post.content,
      url: postUrl,
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
    const postUrl = `https://${post.workspaceSlug}.featul.com/${post.boardSlug}/${post.slug}`

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
              text: `📋 *Board:* ${post.boardName}`,
            },
            {
              type: "mrkdwn",
              text: `👤 *Submitted by:* ${post.authorName || "Anonymous"}`,
            },
          ],
        },
        {
          type: "divider",
        },
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
    const { workspaceIntegration } = await import("@featul/db")
    const { eq } = await import("drizzle-orm")

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
