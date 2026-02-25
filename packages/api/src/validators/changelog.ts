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

export const aiAssistSchema = z
  .object({
    slug: bySlugSchema.shape.slug,
    action: z.enum(["prompt", "format", "improve", "summary"]),
    prompt: z.string().min(1).max(2000).optional(),
    title: z.string().max(256).optional(),
    contentMarkdown: z.string().min(1).max(20000).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.action === "prompt" && !val.prompt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Prompt is required for action=prompt",
        path: ["prompt"],
      });
    }
    if (val.action !== "prompt" && !val.contentMarkdown) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "contentMarkdown is required for this action",
        path: ["contentMarkdown"],
      });
    }
  });

const notraStatuses = ["draft", "published"] as const;

export const importNotraSchema = z
  .object({
    slug: bySlugSchema.shape.slug,
    apiKey: z.string().min(1, "Notra API key is required").max(512).optional(),
    organizationId: z
      .string()
      .min(1, "Notra organization ID is required")
      .max(128)
      .optional(),
    useStoredConnection: z.boolean().optional(),
    status: z.array(z.enum(notraStatuses)).min(1).max(2).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    maxPages: z.number().int().min(1).max(50).optional(),
    mode: z.enum(["upsert", "create_only"]).optional(),
    publishBehavior: z.enum(["preserve", "draft_only"]).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.useStoredConnection) return;
    if (!val.organizationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Notra organization ID is required",
        path: ["organizationId"],
      });
    }
    if (!val.apiKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Notra API key is required",
        path: ["apiKey"],
      });
    }
  });

export const getNotraConnectionSchema = z.object({
  slug: bySlugSchema.shape.slug,
});

export const saveNotraConnectionSchema = z.object({
  slug: bySlugSchema.shape.slug,
  apiKey: z.string().min(1, "Notra API key is required").max(512),
  organizationId: z
    .string()
    .min(1, "Notra organization ID is required")
    .max(128),
});

export const deleteNotraConnectionSchema = z.object({
  slug: bySlugSchema.shape.slug,
});
