import { z } from "zod";
import { bySlugSchema, entryContentSchema } from "./changelog";

export const HELP_COLLECTION_ICONS = [
  "book",
  "bolt",
  "card",
  "user",
  "settings",
  "puzzle",
  "shield",
  "chat",
  "sparkles",
  "bulb",
] as const;

const slug = bySlugSchema.shape.slug;
const icon = z.enum(HELP_COLLECTION_ICONS);

export const helpCollectionCreateSchema = z.object({
  slug,
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional(),
  icon: icon.optional(),
});

export const helpCollectionUpdateSchema = z.object({
  slug,
  collectionId: z.string().min(1),
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(240).nullable().optional(),
  icon: icon.optional(),
});

export const helpReorderSchema = z.object({
  slug,
  ids: z.array(z.string().min(1)).min(1).max(500),
});

export const helpArticleCreateSchema = z.object({
  slug,
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(300).optional(),
  content: entryContentSchema,
  collectionId: z.string().min(1).nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const helpArticleUpdateSchema = z.object({
  slug,
  articleId: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().trim().max(300).nullable().optional(),
  content: entryContentSchema.optional(),
  collectionId: z.string().min(1).nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const helpArticleIdSchema = z.object({
  slug,
  articleId: z.string().min(1),
});

export const helpSearchSchema = z.object({
  slug,
  q: z.string().max(120),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const helpFeedbackSchema = z.object({
  slug,
  articleId: z.string().min(1),
  helpful: z.boolean(),
  /** Set when the visitor flips their earlier answer, so the old vote is taken back. */
  previous: z.boolean().optional(),
});

export const helpVisibilitySchema = z.object({ slug, isVisible: z.boolean() });

export const helpCollectionIdSchema = z.object({
  slug,
  collectionId: z.string().min(1),
});

export const helpArticlesDeleteSchema = z.object({
  slug,
  articleIds: z.array(z.string().min(1)).min(1).max(200),
});

/** A settled public search, sent once the visitor stops typing or opens a result. */
export const helpTrackSearchSchema = z.object({
  slug,
  q: z.string().trim().min(2).max(120),
});

export const helpAskSchema = z.object({
  slug,
  question: z.string().trim().min(3).max(300),
});

export const helpAnalyticsSchema = z.object({
  slug,
  days: z.coerce.number().int().refine((d) => [7, 30, 90].includes(d)).default(30),
});

/** Proposal items the user kept after an import scan; bodies are Markdown. */
export const helpImportApplySchema = z.object({
  slug,
  collections: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        description: z.string().trim().max(240).optional(),
        icon: icon.optional(),
      }),
    )
    .max(8),
  articles: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        summary: z.string().trim().max(300).optional(),
        collection: z.string().trim().max(80).optional(),
        body: z.string().trim().min(1).max(20_000),
      }),
    )
    .min(1)
    .max(30),
});
