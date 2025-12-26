import { z } from "zod"
import { slugSchema } from "./workspace"

export const memberByWorkspaceInputSchema = z.object({
  slug: slugSchema,
  userId: z.string().min(1),
})

export const memberActivityInputSchema = z.object({
  slug: slugSchema,
  userId: z.string().min(1),
  cursor: z.string().nullable().optional(),
  limit: z.number().int().min(1).max(50).default(20),
})
