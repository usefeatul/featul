import { z } from "zod"
import { slugSchema } from "./workspace"

export const reserveSlugInputSchema = z.object({
  email: z.string().trim().email(),
  slug: slugSchema,
})

export const tokenInputSchema = z.object({
  token: z.string().trim().min(1),
})

export const checkSlugPublicInputSchema = z.object({
  slug: slugSchema,
})

