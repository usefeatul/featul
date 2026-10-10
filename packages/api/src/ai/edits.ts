import { z } from "zod";

export const conversationResponseSchema = z
  .object({
    reply: z.string().min(1).max(4000),
    edits: z
      .array(
        z
          .object({
            before: z.string().min(1).max(20000),
            after: z.string().max(20000),
          })
          .strict(),
      )
      .max(50),
    draft: z.string().max(20000).nullable(),
    selection: z.string().max(8000).nullable(),
    title: z.string().min(1).max(256).nullable(),
    summary: z.string().max(512).nullable(),
    tags: z.array(z.string().min(1).max(64)).max(30).nullable().optional(),
    suggestedTags: z
      .array(z.string().min(1).max(64))
      .max(4)
      .nullable()
      .optional(),
  })
  .strict();

export type ConversationResponse = z.infer<typeof conversationResponseSchema>;

export const INVALID_EDIT_MESSAGE =
  "I could not safely apply that edit. Your draft has not changed. Please try a more specific request.";

/** Resolve every edit against the same snapshot before applying any of them. */
export function applyMarkdownEdits(
  markdown: string,
  edits: ConversationResponse["edits"],
) {
  const ranges = edits
    .map(({ before, after }) => {
      const from = markdown.indexOf(before);
      if (!before || from < 0 || markdown.indexOf(before, from + 1) !== -1) {
        throw new Error(INVALID_EDIT_MESSAGE);
      }
      return { from, to: from + before.length, after };
    })
    .sort((a, b) => a.from - b.from);

  for (let index = 1; index < ranges.length; index++) {
    if (ranges[index]!.from < ranges[index - 1]!.to) {
      throw new Error(INVALID_EDIT_MESSAGE);
    }
  }

  let result = markdown;
  for (const range of ranges.reverse()) {
    result = result.slice(0, range.from) + range.after + result.slice(range.to);
  }
  if (result.length > 20000) throw new Error(INVALID_EDIT_MESSAGE);
  return result;
}

export function resolveConversationResponse(
  raw: string,
  input: {
    contentMarkdown?: string;
    selectionMarkdown?: string;
    title?: string;
    summary?: string;
    readOnly?: boolean;
    availableTagNames?: string[];
    selectedTagNames?: string[];
  },
) {
  const parsed = conversationResponseSchema.safeParse(
    (() => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })(),
  );
  if (!parsed.success) throw new Error(INVALID_EDIT_MESSAGE);
  const response = parsed.data;
  const original = input.contentMarkdown ?? "";
  const hasBodyEdit = response.edits.length > 0 || response.draft !== null;
  const hasSelectionEdit = response.selection !== null;
  const hasTagEdit = response.tags != null;
  if (
    (response.draft !== null && (original.trim() || response.edits.length)) ||
    (hasSelectionEdit && (!input.selectionMarkdown || hasBodyEdit)) ||
    (input.selectionMarkdown && hasBodyEdit) ||
    (input.readOnly &&
      (hasBodyEdit ||
        hasSelectionEdit ||
        response.title !== null ||
        response.summary !== null ||
        hasTagEdit)) ||
    (hasTagEdit && response.suggestedTags?.length)
  )
    throw new Error(INVALID_EDIT_MESSAGE);

  const contentMarkdown =
    response.draft ?? applyMarkdownEdits(original, response.edits);
  const availableTags = new Map(
    (input.availableTagNames ?? []).map((name) => [
      name.trim().toLowerCase(),
      name,
    ]),
  );
  const resolveTags = (names: string[]) => [
    ...new Set(
      names.map((name) => {
        const existing = availableTags.get(name.trim().toLowerCase());
        if (!existing) throw new Error(INVALID_EDIT_MESSAGE);
        return existing;
      }),
    ),
  ];
  const tagNames = hasTagEdit ? resolveTags(response.tags!) : undefined;
  const currentTags = new Set(
    (input.selectedTagNames ?? []).map((name) => name.trim().toLowerCase()),
  );
  const tagsChanged =
    tagNames !== undefined &&
    (tagNames.length !== currentTags.size ||
      tagNames.some((name) => !currentTags.has(name.toLowerCase())));
  return {
    reply: response.reply,
    tagNames: tagsChanged ? tagNames : undefined,
    suggestedTags: response.suggestedTags?.length
      ? resolveTags(response.suggestedTags)
      : undefined,
    edits:
      response.edits.length && contentMarkdown !== original
        ? response.edits
        : undefined,
    contentMarkdown: contentMarkdown !== original ? contentMarkdown : undefined,
    selectionMarkdown:
      hasSelectionEdit && response.selection !== input.selectionMarkdown
        ? response.selection!
        : undefined,
    title:
      response.title !== null && response.title !== input.title
        ? response.title
        : undefined,
    summary:
      response.summary !== null && response.summary !== (input.summary ?? "")
        ? response.summary
        : undefined,
  };
}
