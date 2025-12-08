import { z } from "zod"
import { fingerprintSchema } from "./shared"

export const byIdSchema = z.object({ postId: z.string().uuid() })

export const updatePostMetaSchema = z.object({
  postId: z.string().uuid(),
  roadmapStatus: z.string().min(1).max(64).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

export const updatePostBoardSchema = z.object({
  postId: z.string().uuid(),
  boardSlug: z.string().min(1).max(128),
})

export const votePostSchema = z.object({
  postId: z.string().uuid(),
  fingerprint: fingerprintSchema,
})

export const createPostSchema = z.object({
  title: z.string().min(1).max(128),
  content: z.string().min(1),
  image: z.string().url().optional(),
  workspaceSlug: z.string().min(1),
  boardSlug: z.string().min(1),
  fingerprint: fingerprintSchema.optional(),
  roadmapStatus: z.string().min(1).max(64).optional(),
  tags: z.array(z.string().uuid()).optional(),
})

export const updatePostSchema = z.object({
  postId: z.string().uuid(),
  title: z.string().min(1).max(128).optional(),
  content: z.string().min(1).optional(),
  image: z.string().url().optional().nullable(),
  boardSlug: z.string().min(1).optional(),
  roadmapStatus: z.string().min(1).max(64).optional(),
  tags: z.array(z.string().uuid()).optional(),
})

export const reportPostSchema = z.object({
  postId: z.string().uuid(),
  reason: z.enum(["spam", "harassment", "inappropriate", "off_topic", "other"]),
  description: z.string().max(500).optional(),
})
