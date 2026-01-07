import { z } from "zod"

export const getUploadUrlInputSchema = z.object({
  slug: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().optional(),
})

export const getCommentImageUploadUrlInputSchema = z.object({
  postId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
})

export const getPostImageUploadUrlInputSchema = z.object({
  workspaceSlug: z.string().min(1),
  boardSlug: z.string().min(1).optional(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
})

export const getAvatarUploadUrlInputSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
})

export type GetUploadUrlInput = z.infer<typeof getUploadUrlInputSchema>
export type GetCommentImageUploadUrlInput = z.infer<typeof getCommentImageUploadUrlInputSchema>
export type GetPostImageUploadUrlInput = z.infer<typeof getPostImageUploadUrlInputSchema>
export type GetAvatarUploadUrlInput = z.infer<typeof getAvatarUploadUrlInputSchema>
