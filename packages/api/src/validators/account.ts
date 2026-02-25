import { z } from "zod"

export const deleteAccountInputSchema = z.object({
    confirmation: z.literal("DELETE"),
})

export const revokeSessionInputSchema = z.object({
    sessionId: z.string().min(1),
})
