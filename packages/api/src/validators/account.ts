import { z } from "zod"

export const deleteAccountInputSchema = z.object({
    confirmation: z.literal("DELETE"),
})
