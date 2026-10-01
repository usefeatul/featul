import { afterAll, describe, expect, spyOn, test } from "bun:test";
import { Window } from "happy-dom";
import { Editor, Node, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { applyEditorEdits } from "../src/components/editor/patch";
import { getRetryPrompt } from "../src/components/changelog/assistant/retry";
import { detectChatIntent } from "../src/components/changelog/ai/intent";
import {
  getTagDecision,
  getTagRemovalDecision,
} from "../src/components/changelog/assistant/decisions";
import { streamChangelogAiAssist } from "../src/features/changelog/client";

const window = new Window();
const saved = {
  window: globalThis.window,
  document: globalThis.document,
  navigator: globalThis.navigator,
};
Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
});
afterAll(() => Object.assign(globalThis, saved));

// Figure and upload nodes do not register Markdown serializers in the real editor.
const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  addAttributes: () => ({ src: { default: null }, caption: { default: "" } }),
  parseHTML: () => [{ tag: "figure" }],
  renderHTML: ({ HTMLAttributes }) => ["figure", HTMLAttributes],
});

function createEditor(content: string | JSONContent) {
  return new Editor({
    element: window.document.createElement("div") as unknown as HTMLElement,
    extensions: [StarterKit, Markdown, TextStyle, Color, Figure],
    content,
    contentType: typeof content === "string" ? "markdown" : "json",
  });
}

describe("editor changes", () => {
  test("changes a sentence without losing color in an unrelated paragraph", () => {
    const editor = createEditor("Search is faster.\n\nKeep this paragraph.");
    editor.commands.setTextSelection({ from: 20, to: 24 });
    editor.commands.setColor("#ff0000");
    const untouched = editor.state.doc.lastChild!.toJSON();
    expect(
      applyEditorEdits(editor, [
        { before: "Search is faster.", after: "Find answers faster." },
      ]),
    ).toBe(true);
    expect(editor.getMarkdown()).toContain("Find answers faster.");
    expect(editor.state.doc.lastChild!.toJSON()).toEqual(untouched);
    expect(editor.commands.undo()).toBe(true);
    expect(editor.getMarkdown()).toContain("Search is faster.");
    editor.destroy();
  });

  test("applies disjoint edits atomically and retains untouched nodes", () => {
    const editor = createEditor(
      "## Search\n\nSearch is faster.\n\n## Fixes\n\n- Fixed login.\n- Kept links.",
    );
    expect(
      applyEditorEdits(editor, [
        { before: "Search is faster.", after: "Find things quickly." },
        { before: "Fixed login.", after: "Fixed sign-in." },
      ]),
    ).toBe(true);
    expect(editor.getMarkdown()).toContain("Find things quickly.");
    expect(editor.getMarkdown()).toContain("Fixed sign-in.");
    expect(editor.getMarkdown()).toContain("Kept links.");
    editor.destroy();
  });

  test("handles insertions, deletions, and an explicitly requested full rewrite", () => {
    const editor = createEditor("First sentence. Second sentence.");
    expect(
      applyEditorEdits(editor, [
        { before: "First sentence.", after: "First sentence. Added detail." },
      ]),
    ).toBe(true);
    expect(editor.getMarkdown()).toContain("Added detail.");
    expect(
      applyEditorEdits(editor, [{ before: " Second sentence.", after: "" }]),
    ).toBe(true);
    expect(editor.getMarkdown()).not.toContain("Second sentence.");
    expect(
      applyEditorEdits(editor, [
        {
          before: editor.getMarkdown(),
          after: "## New direction\n\nA different draft.",
        },
      ]),
    ).toBe(true);
    expect(editor.getMarkdown()).toContain("## New direction");
    expect(
      applyEditorEdits(editor, [{ before: editor.getMarkdown(), after: "" }]),
    ).toBe(true);
    expect(editor.state.doc.textContent).toBe("");
    editor.destroy();
  });

  test("adds a closing paragraph with a figure and empty paragraphs in the document", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        { type: "paragraph" },
        {
          type: "figure",
          attrs: {
            src: "https://example.com/image.png",
            caption: "Release preview",
          },
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "The opening." }],
        },
        { type: "paragraph" },
        {
          type: "paragraph",
          content: [{ type: "text", text: "The final update." }],
        },
        { type: "paragraph" },
      ],
    });
    const original = editor.getJSON();
    expect(
      applyEditorEdits(editor, [
        {
          before: "The final update.",
          after: "The final update.\n\nThanks for your feedback!",
        },
      ]),
    ).toBe(true);
    expect(editor.getMarkdown()).toContain("Thanks for your feedback!");
    expect(editor.getJSON().content?.slice(0, 5)).toEqual(
      original.content?.slice(0, 5),
    );
    expect(editor.getJSON().content?.at(-1)).toEqual({ type: "paragraph" });
    expect(editor.commands.undo()).toBe(true);
    expect(editor.getJSON()).toEqual(original);
    editor.destroy();
  });

  test("edits both sides of an omitted image without moving or removing it", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First sentence." }],
        },
        {
          type: "figure",
          attrs: { src: "https://example.com/image.png", caption: "Keep me" },
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Last sentence." }],
        },
      ],
    });
    const figure = editor.getJSON().content?.[1];
    expect(
      applyEditorEdits(editor, [
        { before: "First sentence.", after: "An improved opening." },
        { before: "Last sentence.", after: "An improved ending." },
      ]),
    ).toBe(true);
    expect(editor.getJSON().content?.[1]).toEqual(figure);
    expect(editor.getMarkdown()).toContain("An improved opening.");
    expect(editor.getMarkdown()).toContain("An improved ending.");
    editor.destroy();
  });

  test("does not silently remove omitted media during a broad replacement", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First paragraph." }],
        },
        {
          type: "figure",
          attrs: { src: "https://example.com/image.png", caption: "Keep me" },
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Last paragraph." }],
        },
      ],
    });
    const original = editor.getJSON();
    expect(
      applyEditorEdits(editor, [
        { before: editor.getMarkdown(), after: "Entirely different text." },
      ]),
    ).toBe(false);
    expect(editor.getJSON()).toEqual(original);
    editor.destroy();
  });

  test("rejects stale or ambiguous anchors without partial changes", () => {
    const editor = createEditor("Repeated. Repeated.\n\nKeep me.");
    const original = editor.getJSON();
    expect(
      applyEditorEdits(editor, [{ before: "Repeated.", after: "New" }]),
    ).toBe(false);
    expect(
      applyEditorEdits(editor, [
        { before: "Keep me.", after: "Change" },
        { before: "Gone", after: "New" },
      ]),
    ).toBe(false);
    expect(editor.getJSON()).toEqual(original);
    editor.destroy();
  });
});

test("lets conversational context resolve questions, polite edits and follow-ups", () => {
  for (const text of [
    "Could you shorten the opening?",
    "What would you change?",
    "Yes, the second one.",
    "Delete the last sentence.",
    "Rewrite everything.",
    "Write a section about tags.",
  ]) {
    expect(detectChatIntent({ text })).toBe("conversation");
  }
  expect(detectChatIntent({ text: "Suggest workspace tags" })).toBe("tags");
  expect(getTagDecision("yes, make the opening shorter", ["Bugs"])).toBeNull();
  expect(getTagRemovalDecision("remove the Bugs section", ["Bugs"])).toBeNull();
});

test("reports interrupted responses and never calls the edit callback", async () => {
  const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
    new Response('data: {"type":"status","phase":"generating"}\n\n'),
  );
  let applied = false;
  try {
    await expect(
      streamChangelogAiAssist(
        { slug: "demo", action: "chat", prompt: "Shorten it" },
        {
          onDone: () => {
            applied = true;
          },
        },
      ),
    ).rejects.toThrow("interrupted");
    expect(applied).toBe(false);
  } finally {
    fetchMock.mockRestore();
  }
});

test("accepts specific suggested tags without requiring the word tag", () => {
  expect(
    getTagDecision("add ui and design", ["Guide", "Bugs", "UI", "Design"]),
  ).toEqual({ kind: "accept", names: ["UI", "Design"] });
  expect(getTagDecision("please use UI", ["UI", "Design"])).toEqual({
    kind: "accept",
    names: ["UI"],
  });
  expect(
    getTagDecision("add a paragraph about UI and design", ["UI", "Design"]),
  ).toBeNull();
  expect(
    getTagDecision("add a guide to the closing paragraph", ["Guide", "UI"]),
  ).toBeNull();
  expect(getTagDecision("add guidance", ["UI"])).toBeNull();
});

test("retry uses the request associated with the selected error", () => {
  const messages = [
    { id: "first", role: "user" as const, content: "Add a closing paragraph" },
    {
      id: "first-error",
      role: "assistant" as const,
      content: "Formatting error",
    },
    { id: "second", role: "user" as const, content: "Add UI and Design" },
    {
      id: "second-error",
      role: "assistant" as const,
      content: "Formatting error",
    },
  ];
  expect(getRetryPrompt(messages, "first-error")).toBe(
    "Add a closing paragraph",
  );
  expect(getRetryPrompt(messages, "second-error")).toBe("Add UI and Design");
  expect(getRetryPrompt(messages, "missing")).toBeNull();
});
