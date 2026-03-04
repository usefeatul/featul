import { z } from "zod"

/**
 * Supported integration types
 */
export const integrationTypes = ["discord", "slack"] as const
export type IntegrationType = (typeof integrationTypes)[number]
export const githubSuggestionStates = ["pending", "accepted", "rejected"] as const
export type GithubSuggestionState = (typeof githubSuggestionStates)[number]

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

const githubLabelListSchema = z
  .array(z.string().trim().min(1).max(64))
  .min(1, "At least one label is required for GitHub sync")
  .max(50)
  .transform((labels) =>
    Array.from(new Set(labels.map((label) => label.trim().toLowerCase()).filter(Boolean)))
  )

const statusLabelMapSchema = z.record(z.string().trim().min(1).max(64), z.string().trim().min(1).max(64))

export const githubConnectionGetSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
})

export const githubConnectStartSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
})

export const githubConnectionCompleteSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  installationId: z.string().min(1, "Installation ID is required"),
  state: z.string().min(1).optional(),
})

export const githubSelectRepoSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  installationId: z.string().min(1, "Installation ID is required"),
  repositoryId: z.string().min(1, "Repository ID is required"),
  repositoryName: z.string().trim().min(1).max(200),
  repositoryOwner: z.string().trim().min(1).max(200),
  repositoryFullName: z.string().trim().min(1).max(300),
  labelAllowlist: githubLabelListSchema,
  statusLabelMap: statusLabelMapSchema.optional().default({}),
})

export const githubSyncNowSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  mode: z.enum(["backfill", "incremental"]).default("incremental"),
  cursor: z.string().trim().min(1).optional(),
  limit: z.number().int().min(1).max(100).default(30),
})

export const githubSuggestionsListSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  state: z.enum(githubSuggestionStates).optional().default("pending"),
  limit: z.number().int().min(1).max(100).default(50),
})

export const githubSuggestionApplySchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
  issueLinkId: z.string().min(1, "Issue link ID is required"),
  action: z.enum(["accept", "reject"]),
})

export const githubDisconnectSchema = z.object({
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
})

export const githubWebhookPayloadSchema = z.object({
  action: z.string().optional(),
  installation: z
    .object({
      id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    })
    .optional(),
  repository: z
    .object({
      id: z.union([z.string(), z.number()]).transform((v) => String(v)),
      name: z.string(),
      full_name: z.string(),
      owner: z.object({
        login: z.string(),
      }),
    })
    .optional(),
  issue: z
    .object({
      id: z.union([z.string(), z.number()]).transform((v) => String(v)),
      number: z.union([z.string(), z.number()]).transform((v) => String(v)),
      title: z.string().default(""),
      body: z.string().nullable().optional(),
      html_url: z.string().url(),
      state: z.string().default("open"),
      state_reason: z.string().nullable().optional(),
      updated_at: z.string().optional(),
      pull_request: z.any().optional(),
      labels: z
        .array(
          z.object({
            name: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
})

export type ConnectWebhookInput = z.infer<typeof connectWebhookSchema>
export type DisconnectWebhookInput = z.infer<typeof disconnectWebhookSchema>
export type TestWebhookInput = z.infer<typeof testWebhookSchema>
export type ListIntegrationsInput = z.infer<typeof listIntegrationsSchema>
export type GithubConnectionGetInput = z.infer<typeof githubConnectionGetSchema>
export type GithubConnectStartInput = z.infer<typeof githubConnectStartSchema>
export type GithubConnectionCompleteInput = z.infer<typeof githubConnectionCompleteSchema>
export type GithubSelectRepoInput = z.infer<typeof githubSelectRepoSchema>
export type GithubSyncNowInput = z.infer<typeof githubSyncNowSchema>
export type GithubSuggestionsListInput = z.infer<typeof githubSuggestionsListSchema>
export type GithubSuggestionApplyInput = z.infer<typeof githubSuggestionApplySchema>
export type GithubDisconnectInput = z.infer<typeof githubDisconnectSchema>
export type GithubWebhookPayload = z.infer<typeof githubWebhookPayloadSchema>
