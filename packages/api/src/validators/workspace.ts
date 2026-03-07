import { z } from "zod"
import { domainUrlSchema, isDomainHostValid } from "./domain"
import { isReservedWorkspaceName, isReservedWorkspaceSlug } from "../shared/workspace-slug"

export const slugSchema = z
  .string()
  .min(5)
  .max(32)
  .regex(/^[a-z]+$/, "Slug must contain only lowercase letters")

const creatableSlugSchema = slugSchema.refine((slug) => !isReservedWorkspaceSlug(slug), {
  message: "Slug is reserved",
})

const workspaceNameSchema = z.string().trim().min(1).max(15)
const creatableWorkspaceNameSchema = workspaceNameSchema.refine(
  (name) => !isReservedWorkspaceName(name),
  { message: "Workspace name is reserved" }
)

export const workspaceSlugInputSchema = z.object({
  slug: slugSchema,
})

export const checkSlugInputSchema = z.object({
  slug: slugSchema,
})

export const createWorkspaceInputSchema = z.object({
  name: creatableWorkspaceNameSchema,
  domain: domainUrlSchema,
  slug: creatableSlugSchema,
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
  name: creatableWorkspaceNameSchema,
})

export const deleteWorkspaceInputSchema = z.object({
  slug: slugSchema,
  // Name must be provided and will be validated server-side against the actual workspace name
  confirmName: z.string().trim().min(1),
})

export const importCsvInputSchema = z.object({
  slug: slugSchema,
  csvContent: z.string().max(10_000_000, "CSV payload too large"),
})

export const updateTimezoneInputSchema = z.object({
  slug: slugSchema,
  timezone: z.string().min(1),
})
