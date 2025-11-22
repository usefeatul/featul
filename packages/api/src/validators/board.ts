import { z } from "zod"
import { slugSchema as workspaceSlugSchema } from "./workspace"

export const boardSlugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "Board slug must be lowercase, digits or hyphens")

export const byBoardInputSchema = z.object({
  slug: workspaceSlugSchema,
  boardSlug: boardSlugSchema,
})