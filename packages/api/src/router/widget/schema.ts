import { z } from "zod";
import { POST_MAX_IMAGES } from "../../upload/policy";
import { POST_IMAGE_UPLOAD_POLICY } from "../../storage/upload";
import { isSafeWidgetParentOrigin } from "../../shared/identity";

function unwrapQueryValue(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed) as { json?: unknown };
        if (parsed && typeof parsed === "object" && "json" in parsed) {
          return parsed.json;
        }
      } catch {
        return value;
      }
    }
    return value;
  }
  if (value && typeof value === "object" && "json" in value) {
    return (value as { json: unknown }).json;
  }
  return value;
}

function isLocalWidgetHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

const widgetUrlSchema = z
  .string()
  .trim()
  .url()
  .max(2048)
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && isLocalWidgetHostname(url.hostname))
    );
  }, "URL must use HTTPS");

export const parentOriginSchema = z.preprocess(
  unwrapQueryValue,
  z
    .string()
    .trim()
    .max(2048)
    .refine(isSafeWidgetParentOrigin, "Invalid widget parent origin"),
);
export const projectIdInput = z.object({
  projectId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-zA-Z0-9_-]+$/),
});
export const projectInput = projectIdInput.extend({
  parentOrigin: parentOriginSchema,
});

export const widgetIdentitySchema = z.object({
  id: z.string().trim().min(1).max(256),
  email: z.string().trim().email().max(320),
  name: z.string().trim().max(160).optional(),
  avatar: widgetUrlSchema.optional(),
  expiresAt: z.number().int().positive(),
  signature: z
    .string()
    .regex(/^[a-f0-9]{64}$/i)
    .optional(),
});

export const identifySchema = projectInput.extend({
  user: widgetIdentitySchema.nullable().optional(),
});

const widgetPostImagesSchema = z
  .array(
    z.object({
      url: widgetUrlSchema,
      name: z.string().max(255).optional(),
      type: z.string().max(128).optional(),
    }),
  )
  .max(POST_MAX_IMAGES)
  .optional();

export const createSchema = projectInput.extend({
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(5000),
  boardId: z.string().min(1).max(128),
  image: widgetUrlSchema.optional(),
  images: widgetPostImagesSchema,
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).max(256).optional(),
});

export const uploadImageSchema = projectInput.extend({
  boardId: z.string().min(1).max(128),
  fileName: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[^/\\]+$/, "Invalid file name"),
  contentType: z
    .string()
    .min(1)
    .max(128)
    .regex(
      /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i,
      "Invalid content type",
    ),
  fileSize: z.number().int().positive().max(POST_IMAGE_UPLOAD_POLICY.maxBytes),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).max(256).optional(),
});

export const deleteImageSchema = projectInput.extend({
  url: widgetUrlSchema,
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).max(256).optional(),
});

export const voteSchema = projectInput.extend({
  postId: z.string().min(1).max(128),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).max(256).optional(),
});

export const similarSchema = projectInput.extend({
  title: z.string().min(2).max(128),
  boardId: z.string().min(1).max(128).optional(),
});

export const viewerSchema = z.object({
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).max(256).optional(),
});

export const ROADMAP_STATUS_VALUES = [
  "pending",
  "review",
  "planned",
  "progress",
  "completed",
  "closed",
] as const;

export const postsSchema = projectInput.merge(viewerSchema).extend({
  boardId: z.string().min(1).max(128).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "top"]).default("newest"),
  status: z.enum(ROADMAP_STATUS_VALUES).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const postDetailSchema = projectInput
  .merge(viewerSchema)
  .extend({
    postId: z.string().min(1).max(128).optional(),
    slug: z.string().min(1).max(180).optional(),
  })
  .refine((value) => Boolean(value.postId || value.slug), {
    message: "postId or slug is required",
  });

export const commentsSchema = projectInput.merge(viewerSchema).extend({
  postId: z.string().min(1).max(128),
});

export const createCommentSchema = projectInput
  .merge(viewerSchema)
  .extend({
    postId: z.string().min(1).max(128),
    content: z.string().trim().max(5000).default(""),
    parentId: z.string().min(1).max(128).optional(),
    image: widgetUrlSchema.optional(),
  })
  .refine((value) => Boolean(value.content.trim() || value.image), {
    message: "Comment text or image is required",
  });

export const voteCommentSchema = projectInput.merge(viewerSchema).extend({
  commentId: z.string().min(1).max(128),
});

export type WidgetIdentity = z.infer<typeof widgetIdentitySchema>;
