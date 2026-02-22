import { z } from "zod"

const fileNameSchema = z
  .string()
  .min(1)
  .max(180)
  .regex(/^[^/\\]+$/, "Invalid file name")

const contentTypeSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i, "Invalid content type")

const fileSizeSchema = z.number().int().positive().max(10 * 1024 * 1024)

const workspaceUploadFolderSchema = z
  .enum(["branding/logo", "changelog/content", "changelog/covers"])
  .optional()

export const getUploadUrlInputSchema = z.object({
  slug: z.string().min(1),
  fileName: fileNameSchema,
  contentType: contentTypeSchema,
  fileSize: fileSizeSchema,
  folder: workspaceUploadFolderSchema,
})

export const getCommentImageUploadUrlInputSchema = z.object({
  postId: z.string().min(1),
  fileName: fileNameSchema,
  contentType: contentTypeSchema,
  fileSize: fileSizeSchema,
})

export const getPostImageUploadUrlInputSchema = z.object({
  workspaceSlug: z.string().min(1),
  boardSlug: z.string().min(1),
  fileName: fileNameSchema,
  contentType: contentTypeSchema,
  fileSize: fileSizeSchema,
})

export const getAvatarUploadUrlInputSchema = z.object({
  fileName: fileNameSchema,
  contentType: contentTypeSchema,
  fileSize: fileSizeSchema,
})

export type GetUploadUrlInput = z.infer<typeof getUploadUrlInputSchema>
export type GetCommentImageUploadUrlInput = z.infer<typeof getCommentImageUploadUrlInputSchema>
export type GetPostImageUploadUrlInput = z.infer<typeof getPostImageUploadUrlInputSchema>
export type GetAvatarUploadUrlInput = z.infer<typeof getAvatarUploadUrlInputSchema>
