import { describe, expect, test } from "bun:test";
import {
  applyMarkdownEdits,
  resolveConversationResponse,
  type ConversationResponse,
} from "./edits";

const draft =
  "## Search\n\nSearch is faster. Try it today.\n\n## Fixes\n\n- Fixed [login](/login).\n- Kept **formatting**.\n";
const response = (changes: Partial<ConversationResponse> = {}) =>
  JSON.stringify({
    reply: "Updated the opening sentence.",
    edits: [],
    draft: null,
    selection: null,
    title: null,
    summary: null,
    ...changes,
  });

describe("conversational editing", () => {
  test("changes one sentence and preserves all surrounding markdown verbatim", () => {
    const result = resolveConversationResponse(
      response({
        edits: [
          { before: "Search is faster.", after: "Find what you need faster." },
        ],
      }),
      { contentMarkdown: draft, title: "Search improvements" },
    );
    expect(result.contentMarkdown).toBe(
      draft.replace("Search is faster.", "Find what you need faster."),
    );
    expect(result.title).toBeUndefined();
    expect(result.summary).toBeUndefined();
  });

  test("resolves multiple edits against the original, not previously replaced text", () => {
    expect(
      applyMarkdownEdits("First. Second.", [
        { before: "First.", after: "Second." },
        { before: "Second.", after: "Third." },
      ]),
    ).toBe("Second. Third.");
  });

  test("supports deletion, including an entire draft or selected excerpt", () => {
    expect(
      resolveConversationResponse(
        response({ edits: [{ before: draft, after: "" }] }),
        { contentMarkdown: draft },
      ).contentMarkdown,
    ).toBe("");
    expect(
      resolveConversationResponse(response({ selection: "" }), {
        contentMarkdown: draft,
        selectionMarkdown: "Try it today.",
      }).selectionMarkdown,
    ).toBe("");
  });

  test("discussion and clarification return no document mutations", () => {
    const result = resolveConversationResponse(
      response({ reply: "Which sentence did you mean?" }),
      { contentMarkdown: draft },
    );
    expect(result.contentMarkdown).toBeUndefined();
    expect(result.selectionMarkdown).toBeUndefined();
    expect(result.edits).toBeUndefined();
  });

  test("title-only and summary-only edits leave the body untouched", () => {
    const result = resolveConversationResponse(
      response({ title: "Faster search", summary: "" }),
      { contentMarkdown: draft, summary: "Old summary" },
    );
    expect(result.title).toBe("Faster search");
    expect(result.summary).toBe("");
    expect(result.contentMarkdown).toBeUndefined();
  });

  test("allows a new draft only when the editor is empty", () => {
    expect(
      resolveConversationResponse(response({ draft: "A first draft." }), {})
        .contentMarkdown,
    ).toBe("A first draft.");
    expect(() =>
      resolveConversationResponse(response({ draft: "Replacement" }), {
        contentMarkdown: draft,
      }),
    ).toThrow();
  });

  test("rejects missing, ambiguous, overlapping, and empty anchors", () => {
    for (const edits of [
      [{ before: "missing", after: "new" }],
      [{ before: "a", after: "new" }],
      [{ before: "", after: "new" }],
      [
        { before: "Search is faster.", after: "New" },
        { before: "is faster.", after: "Newer" },
      ],
    ])
      expect(() => applyMarkdownEdits(draft, edits)).toThrow();
  });

  test("rejects body edits while a selection is active and mutations in read-only requests", () => {
    const raw = response({ edits: [{ before: "Search", after: "Find" }] });
    expect(() =>
      resolveConversationResponse(raw, {
        contentMarkdown: draft,
        selectionMarkdown: "Try it today.",
      }),
    ).toThrow();
    expect(() =>
      resolveConversationResponse(response({ title: "New" }), {
        readOnly: true,
      }),
    ).toThrow();
  });

  test("rejects malformed, truncated and oversized output atomically", () => {
    expect(() => resolveConversationResponse('{"reply":', {})).toThrow();
    expect(() =>
      resolveConversationResponse(response({ title: "x".repeat(257) }), {}),
    ).toThrow();
    expect(() =>
      applyMarkdownEdits("old" + "x".repeat(19997), [
        { before: "old", after: "longer" },
      ]),
    ).toThrow();
  });
});

describe("conversation tag actions", () => {
  const context = {
    contentMarkdown: draft,
    availableTagNames: ["Guide", "Bugs", "UI", "Design"],
    selectedTagNames: ["Design"],
  };

  test("applies existing tags without replacing content or metadata", () => {
    const result = resolveConversationResponse(
      response({
        reply: "Added all three tags.",
        tags: ["Design", "Guide", "Bugs", "UI"],
      }),
      context,
    );
    expect(result.tagNames).toEqual(["Design", "Guide", "Bugs", "UI"]);
    expect(result.contentMarkdown).toBeUndefined();
    expect(result.title).toBeUndefined();
    expect(result.summary).toBeUndefined();
    expect(result.edits).toBeUndefined();
  });

  test("suggestions do not apply tags", () => {
    const result = resolveConversationResponse(
      response({ suggestedTags: ["Guide", "Bugs", "UI"] }),
      context,
    );
    expect(result.suggestedTags).toEqual(["Guide", "Bugs", "UI"]);
    expect(result.tagNames).toBeUndefined();
    expect(result.contentMarkdown).toBeUndefined();
  });

  test("resolves exact workspace names and deduplicates without substring matching", () => {
    expect(
      resolveConversationResponse(
        response({ tags: [" guide ", "GUIDE", "ui"] }),
        context,
      ).tagNames,
    ).toEqual(["Guide", "UI"]);
    expect(() =>
      resolveConversationResponse(response({ tags: ["Guidance"] }), context),
    ).toThrow();
    expect(() =>
      resolveConversationResponse(
        response({ suggestedTags: ["Unknown"] }),
        context,
      ),
    ).toThrow();
  });

  test("supports removing all tags and suppresses unchanged selections", () => {
    expect(
      resolveConversationResponse(response({ tags: [] }), context).tagNames,
    ).toEqual([]);
    expect(
      resolveConversationResponse(response({ tags: ["design"] }), context)
        .tagNames,
    ).toBeUndefined();
  });

  test("rejects tag changes in read-only mode and mixed application/suggestions", () => {
    expect(() =>
      resolveConversationResponse(response({ tags: ["UI"] }), {
        ...context,
        readOnly: true,
      }),
    ).toThrow();
    expect(() =>
      resolveConversationResponse(
        response({ tags: ["UI"], suggestedTags: ["Bugs"] }),
        context,
      ),
    ).toThrow();
  });
});
