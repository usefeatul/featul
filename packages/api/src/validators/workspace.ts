import { z } from "zod"

export const slugSchema = z
  .string()
  .min(5)
  .max(32)
  .regex(/^[a-z]+$/, "Slug must contain only lowercase letters")

export const checkSlugInputSchema = z.object({
  slug: slugSchema,
})

export const createWorkspaceInputSchema = z.object({
  name: z.string().min(1).max(64),
  domain: z
    .string()
    .trim()
    .transform((v) => (v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`))
    .pipe(z.string().url()),
  slug: slugSchema,
  timezone: z.string().min(1),
})