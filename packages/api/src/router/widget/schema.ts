import { z } from "zod";
import { POST_IMAGE_UPLOAD_POLICY } from "../../shared/storage-upload";

export const parentOriginSchema = z.string().url().optional();
export const projectInput = z.object({
  projectId: z.string().min(1),
  parentOrigin: parentOriginSchema,
});

export const identifySchema = projectInput.extend({
  user: z.object({
    id: z.string().min(1).max(256),
    email: z.string().email(),
    name: z.string().max(160).optional(),
    avatar: z.string().url().optional(),
    signature: z.string().optional(),
  }),
});

export const widgetIdentitySchema = z.object({
  id: z.string().min(1).max(256),
  email: z.string().email(),
  name: z.string().max(160).optional(),
  avatar: z.string().url().optional(),
  signature: z.string().optional(),
});

export const createSchema = projectInput.extend({
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(5000),
  boardId: z.string().min(1),
  image: z.string().url().optional(),
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
});

export const uploadImageSchema = projectInput.extend({
  boardId: z.string().min(1),
  fileName: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[^/\\]+$/, "Invalid file name"),
  contentType: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i, "Invalid content type"),
  fileSize: z.number().int().positive().max(POST_IMAGE_UPLOAD_POLICY.maxBytes),
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
});

export const voteSchema = projectInput.extend({
  postId: z.string().min(1),
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
});

export const similarSchema = projectInput.extend({
  title: z.string().min(2).max(128),
  boardId: z.string().min(1).optional(),
});

export const viewerSchema = z.object({
  userId: z.string().min(1).optional(),
  identity: widgetIdentitySchema.optional(),
  fingerprint: z.string().min(1).optional(),
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
  boardId: z.string().min(1).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "top"]).default("newest"),
  status: z.enum(ROADMAP_STATUS_VALUES).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const postDetailSchema = projectInput.merge(viewerSchema).extend({
  postId: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
}).refine((value) => Boolean(value.postId || value.slug), {
  message: "postId or slug is required",
});

export const commentsSchema = projectInput.merge(viewerSchema).extend({
  postId: z.string().min(1),
});

export const createCommentSchema = projectInput.merge(viewerSchema).extend({
  postId: z.string().min(1),
  content: z.string().trim().max(5000).default(""),
  parentId: z.string().min(1).optional(),
  image: z.string().url().optional(),
}).refine((value) => Boolean(value.content.trim() || value.image), {
  message: "Comment text or image is required",
});

export const voteCommentSchema = projectInput.merge(viewerSchema).extend({
  commentId: z.string().min(1),
});

export type WidgetIdentity = z.infer<typeof widgetIdentitySchema>;
