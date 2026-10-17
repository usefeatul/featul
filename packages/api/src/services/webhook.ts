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
  status?: string
  image?: string | null
  createdAt: Date
}

function sanitizeWebhookText(text: string, max: number): string {
  return String(text || "")
    .replace(/[&<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
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

    const title = sanitizeWebhookText(post.title, 200)
    const description = sanitizeWebhookText(post.content, 300)
    const boardName = sanitizeWebhookText(post.boardName, 80)
    const authorName = sanitizeWebhookText(post.authorName || "Anonymous", 80)
    const statusLabel = sanitizeWebhookText(
      post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : "Pending",
      40,
    )

    const embed = {
      author: {
        name: "New Feedback Submission",
      },
      title,
      url: postUrl,
      color: 5814783, // Featul brand color (hex: #58b0ff)
      description:
        post.content.length > 300 ? `${description}...` : description,
      ...(post.image ? { thumbnail: { url: post.image } } : {}),
      fields: [
        {
          name: "Board",
          value: `**${boardName}**`,
          inline: true,
        },
        {
          name: "Status",
          value: `**${statusLabel}**`,
          inline: true,
        },
        {
          name: "Submitted by",
          value: `**${authorName}**`,
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
      signal: AbortSignal.timeout(8000),
      redirect: "error",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      await response.body?.cancel()
      return { success: false, error: `Discord returned HTTP ${response.status}` }
    }

    await response.body?.cancel()
    return { success: true }
  } catch {
    // Fetch errors can contain the credential-bearing webhook URL.
    return { success: false, error: "Webhook request failed or timed out" }
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

    const title = sanitizeWebhookText(post.title, 150)
    const content = sanitizeWebhookText(post.content, 200)
    const boardName = sanitizeWebhookText(post.boardName, 80)
    const authorName = sanitizeWebhookText(post.authorName || "Anonymous", 80)
    const statusLabel = sanitizeWebhookText(
      post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : "Pending",
      40,
    )

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
            text: `*<${postUrl}|${title}>*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              post.content.length > 200 ? `${content}...` : content,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*Board:* ${boardName}`,
            },
            {
              type: "mrkdwn",
              text: `*Status:* ${statusLabel}`,
            },
            {
              type: "mrkdwn",
              text: `*Submitted by:* ${authorName}`,
            },
          ],
        },
        {
          type: "divider",
        },
        ...(post.image ? [{
          type: "image",
          image_url: post.image,
          alt_text: title,
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
      signal: AbortSignal.timeout(8000),
      redirect: "error",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      await response.body?.cancel()
      return { success: false, error: `Slack returned HTTP ${response.status}` }
    }

    await response.body?.cancel()
    return { success: true }
  } catch {
    // Fetch errors can contain the credential-bearing webhook URL.
    return { success: false, error: "Webhook request failed or timed out" }
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

export type { PostNotificationData }
