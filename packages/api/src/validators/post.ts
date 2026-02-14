import { z } from "zod"
import { fingerprintSchema } from "./shared"
import {
  POST_CONTENT_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from "./postValidation"

const postTitleSchema = z
  .string()
  .trim()
  .min(POST_TITLE_MIN_LENGTH, `Title must be at least ${POST_TITLE_MIN_LENGTH} characters`)
  .max(POST_TITLE_MAX_LENGTH, `Title must be at most ${POST_TITLE_MAX_LENGTH} characters`)

const postContentSchema = z
  .string()
  .trim()
  .min(POST_CONTENT_MIN_LENGTH)

export const byIdSchema = z.object({ postId: z.string().min(1) })

export const updatePostMetaSchema = z.object({
  postId: z.string().min(1),
  roadmapStatus: z.string().min(1).max(64).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

export const updatePostBoardSchema = z.object({
  postId: z.string().min(1),
  boardSlug: z.string().min(1).max(128),
})

export const votePostSchema = z.object({
  postId: z.string().min(1),
  fingerprint: fingerprintSchema,
})

export const createPostSchema = z.object({
  title: postTitleSchema,
  content: postContentSchema,
  image: z.string().url().optional(),
  workspaceSlug: z.string().min(1),
  boardSlug: z.string().min(1),
  fingerprint: fingerprintSchema.optional(),
  roadmapStatus: z.string().min(1).max(64).optional(),
  tags: z.array(z.string().min(1)).optional(),
})

export const updatePostSchema = z.object({
  postId: z.string().min(1),
  title: postTitleSchema.optional(),
  content: postContentSchema.optional(),
  image: z.string().url().optional().nullable(),
  boardSlug: z.string().min(1).optional(),
  roadmapStatus: z.string().min(1).max(64).optional(),
  tags: z.array(z.string().min(1)).optional(),
})

export const reportPostSchema = z.object({
  postId: z.string().min(1),
  reason: z.enum(["spam", "harassment", "inappropriate", "off_topic", "other"]),
  description: z.string().max(500).optional(),
})

export const getSimilarSchema = z.object({
  title: z.string().min(1),
  boardSlug: z.string().min(1),
  workspaceSlug: z.string().min(1),
})

export const mergePostSchema = z.object({
  postId: z.string().min(1),
  targetPostId: z.string().min(1),
  mergeType: z.enum(["merge_into", "merge_here"]),
  reason: z.string().max(500).optional(),
})

export const mergeHerePostSchema = z.object({
  postId: z.string().min(1),
  sourcePostIds: z.array(z.string().min(1)).min(1),
  reason: z.string().max(500).optional(),
})

export const searchMergeCandidatesSchema = z.object({
  postId: z.string().min(1),
  query: z.string().max(128).optional(),
  excludeSelf: z.boolean().optional().default(true),
})
