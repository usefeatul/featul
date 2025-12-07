import { z } from "zod"

const attachmentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  type: z.string(),
})

const metadataSchema = z.object({
  attachments: z.array(attachmentSchema).optional(),
  mentions: z.array(z.string()).optional(),
  editHistory: z.array(z.object({ content: z.string(), editedAt: z.string() })).optional(),
})

export const createCommentInputSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().max(5000).default(""),
  parentId: z.string().uuid().optional(),
  metadata: metadataSchema.optional(),
  fingerprint: z.string().optional(),
}).refine(
  (data) => {
    const hasContent = data.content.trim().length > 0
    const hasAttachments = data.metadata?.attachments && data.metadata.attachments.length > 0
    return hasContent || hasAttachments
  },
  {
    message: "Comment must have content or an image",
  }
)

export const updateCommentInputSchema = z.object({
  commentId: z.string().uuid(),
  content: z.string().min(1).max(5000),
})

export const deleteCommentInputSchema = z.object({
  commentId: z.string().uuid(),
})

export const listCommentsInputSchema = z.object({
  postId: z.string().uuid(),
  fingerprint: z.string().optional(),
})

export const voteCommentInputSchema = z.object({
  commentId: z.string().uuid(),
  voteType: z.enum(["upvote", "downvote"]),
  fingerprint: z.string().optional(),
})

export const reportCommentInputSchema = z.object({
  commentId: z.string().uuid(),
  reason: z.enum(["spam", "harassment", "inappropriate", "off_topic", "other"]),
  description: z.string().max(1000).optional(),
})

export const pinCommentInputSchema = z.object({
  commentId: z.string().uuid(),
  isPinned: z.boolean(),
})

export const mentionsListInputSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
})

export const mentionsMarkReadInputSchema = z.object({
  id: z.string().uuid(),
})

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>
export type ListCommentsInput = z.infer<typeof listCommentsInputSchema>
export type VoteCommentInput = z.infer<typeof voteCommentInputSchema>
export type ReportCommentInput = z.infer<typeof reportCommentInputSchema>
export type PinCommentInput = z.infer<typeof pinCommentInputSchema>
export type MentionsListInput = z.infer<typeof mentionsListInputSchema>
export type MentionsMarkReadInput = z.infer<typeof mentionsMarkReadInputSchema>
