import { z } from "zod"
import { domainUrlSchema, isDomainHostValid } from "./domain"

export const slugSchema = z
  .string()
  .min(5)
  .max(32)
  .regex(/^[a-z]+$/, "Slug must contain only lowercase letters")

export const checkSlugInputSchema = z.object({
  slug: slugSchema,
})

export const createWorkspaceInputSchema = z.object({
  name: z.string().min(1).max(15),
  domain: domainUrlSchema,
  slug: slugSchema,
  timezone: z.string().min(1),
})

export const updateCustomDomainInputSchema = z.object({
  slug: slugSchema,
  enabled: z.boolean(),
  customDomain: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .refine((value) => value === undefined || isDomainHostValid(value), {
      message: "Invalid domain host",
    }),
})

export const createDomainInputSchema = z.object({
  slug: slugSchema,
  domain: domainUrlSchema,
})

export const verifyDomainInputSchema = z.object({
  slug: slugSchema,
  checkDns: z.boolean().default(true),
})

export const updateWorkspaceNameInputSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(15),
})

export const deleteWorkspaceInputSchema = z.object({
  slug: slugSchema,
  // Name must be provided and will be validated server-side against the actual workspace name
  confirmName: z.string().trim().min(1),
})

export const importCsvInputSchema = z.object({
  slug: slugSchema,
  csvContent: z.string(),
})

export const updateTimezoneInputSchema = z.object({
  slug: slugSchema,
  timezone: z.string().min(1),
})
