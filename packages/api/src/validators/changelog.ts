import { z } from "zod";

export const bySlugSchema = z.object({ slug: z.string().min(2).max(64) });

export const entryContentSchema = z
    .object({
        type: z.string(),
        content: z.array(z.any()).optional(),
    })
    .passthrough();

export const createEntrySchema = z.object({
    slug: bySlugSchema.shape.slug,
    title: z.string().min(1).max(256),
    content: entryContentSchema,
    summary: z.string().max(512).optional(),
    coverImage: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["draft", "published"]).optional(),
});

export const updateEntrySchema = z.object({
    slug: bySlugSchema.shape.slug,
    entryId: z.string().min(1),
    title: z.string().min(1).max(256).optional(),
    content: entryContentSchema.optional(),
    summary: z.string().max(512).optional().nullable(),
    coverImage: z.string().url().optional().nullable(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["draft", "published"]).optional(),
});

export const aiAssistSchema = z.object({
    slug: bySlugSchema.shape.slug,
    action: z.enum(["prompt", "format", "improve", "summary"]),
    prompt: z.string().min(1).max(2000).optional(),
    title: z.string().max(256).optional(),
    contentMarkdown: z.string().min(1).max(20000).optional(),
}).superRefine((val, ctx) => {
    if (val.action === "prompt" && !val.prompt) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prompt is required for action=prompt", path: ["prompt"] });
    }
    if (val.action !== "prompt" && !val.contentMarkdown) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "contentMarkdown is required for this action", path: ["contentMarkdown"] });
    }
});
