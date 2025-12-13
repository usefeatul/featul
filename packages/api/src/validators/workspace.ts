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

export const updateCustomDomainInputSchema = z.object({
  slug: slugSchema,
  enabled: z.boolean(),
  customDomain: z.string().trim().optional(),
})

export const createDomainInputSchema = z.object({
  slug: slugSchema,
  domain: z
    .string()
    .trim()
    .transform((v) => (v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`))
    .pipe(z.string().url()),
})

export const verifyDomainInputSchema = z.object({
  slug: slugSchema,
  checkDns: z.boolean().default(true),
})

export const updateWorkspaceNameInputSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(64),
})

export const deleteWorkspaceInputSchema = z.object({
  slug: slugSchema,
  // Name must be provided and will be validated server-side against the actual workspace name
  confirmName: z.string().trim().min(1),
})
