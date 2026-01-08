import { z } from "zod"

/**
 * Supported integration types
 */
export const integrationTypes = ["discord", "slack"] as const
export type IntegrationType = (typeof integrationTypes)[number]

/**
 * Webhook URL validation patterns
 */
const discordWebhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/
const slackWebhookRegex = /^https:\/\/hooks\.slack\.com\/services\/[\w-]+\/[\w-]+\/[\w-]+$/

/**
 * Schema for connecting a webhook integration
 */
export const connectWebhookSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  type: z.enum(integrationTypes, {
    errorMap: () => ({ message: "Invalid integration type" }),
  }),
  webhookUrl: z.string().url("Invalid webhook URL").refine(
    (url) => {
      // Validate URL matches expected webhook format
      return discordWebhookRegex.test(url) || slackWebhookRegex.test(url)
    },
    { message: "Invalid webhook URL format. Please provide a valid Discord or Slack webhook URL." }
  ),
})

/**
 * Schema for disconnecting a webhook integration
 */
export const disconnectWebhookSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  type: z.enum(integrationTypes, {
    errorMap: () => ({ message: "Invalid integration type" }),
  }),
})

/**
 * Schema for testing a webhook integration
 */
export const testWebhookSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  type: z.enum(integrationTypes, {
    errorMap: () => ({ message: "Invalid integration type" }),
  }),
})

/**
 * Schema for listing workspace integrations
 */
export const listIntegrationsSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
})

export type ConnectWebhookInput = z.infer<typeof connectWebhookSchema>
export type DisconnectWebhookInput = z.infer<typeof disconnectWebhookSchema>
export type TestWebhookInput = z.infer<typeof testWebhookSchema>
export type ListIntegrationsInput = z.infer<typeof listIntegrationsSchema>
