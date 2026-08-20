import {
  CHANGELOG_BODY_STRUCTURE,
  DETAIL_GUIDANCE,
  TONE_GUIDANCE,
} from "./constants";
import { formatSourcePostsBlock } from "./sources";
import type {
  AiAction,
  AiDetailLevel,
  AiSourcePost,
  AiTone,
  StructuredGenerationAction,
} from "./types";

type PromptInput = {
  action: AiAction;
  prompt?: string;
  title?: string;
  contentMarkdown?: string;
  tone?: AiTone;
  detailLevel?: AiDetailLevel;
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
};

function sharedContext(input: PromptInput) {
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}` : "";
  const contentBlock = input.contentMarkdown
    ? `Content (Markdown):\n${input.contentMarkdown}`
    : "";
  const workspaceLine = input.workspaceName
    ? `Workspace/product: ${input.workspaceName}`
    : "";
  const sourcePostsBlock = input.sourcePosts?.length
    ? `Shipped or in-progress feedback items:\n${formatSourcePostsBlock(input.sourcePosts)}`
    : "";

  return { titleLine, contentBlock, workspaceLine, sourcePostsBlock };
}

export function buildStreamRefineUserPrompt(input: PromptInput) {
  const { titleLine, contentBlock } = sharedContext(input);

  switch (input.action) {
    case "format":
      return [
        "Fix formatting and structure without changing meaning.",
        "Preserve or improve headings, paragraphs, and bullet lists.",
        "Output format: GitHub-flavored Markdown body only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "improve":
      return [
        "Improve clarity, flow, and polish without losing important detail.",
        "Make the writing sound more professional and user-friendly.",
        "If the entry is too thin, expand key sections with helpful context.",
        "Output format: GitHub-flavored Markdown body only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "expand":
      return [
        "Expand this changelog entry with more useful detail.",
        "Add missing context, user benefits, examples, and concrete bullet points.",
        "Use headings and lists where helpful. Do not remove existing information.",
        "Output format: GitHub-flavored Markdown body only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "summary":
      return [
        "Write a compelling 2-3 sentence summary (<= 512 characters) that previews the entry.",
        "Output format: plain text summary only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    default:
      return "";
  }
}

export function buildTitleStreamPrompt(input: {
  action: StructuredGenerationAction;
  prompt?: string;
  tone?: AiTone;
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
}) {
  const workspaceLine = input.workspaceName
    ? `Product: ${input.workspaceName}`
    : "";
  const sourcePostsBlock = input.sourcePosts?.length
    ? formatSourcePostsBlock(input.sourcePosts)
    : "";
  const tone = TONE_GUIDANCE[input.tone ?? "user-friendly"];

  if (input.action === "generateFromPosts") {
    return [
      "Write one specific changelog title for the shipped feedback below.",
      "Requirements:",
      "- 5-12 words",
      "- Name the actual features or improvements shipped",
      "- Do NOT use generic titles like 'Product update', 'Release', or 'Changelog'",
      tone,
      workspaceLine,
      sourcePostsBlock,
      input.prompt?.trim() ? `Notes: ${input.prompt.trim()}` : "",
      "Output format (line 1 must start with TITLE:):",
      "TITLE: <specific descriptive title>",
      "Example: TITLE: Faster roadmap filters and bulk triage actions",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "Write one specific changelog title for the request below.",
    "Requirements:",
    "- 5-12 words",
    "- Name the actual topic being shipped",
    "- Do NOT use generic titles like 'Product update', 'Release', or 'Changelog'",
    tone,
    workspaceLine,
    input.prompt?.trim() ? `Prompt: ${input.prompt.trim()}` : "",
    "Output format (line 1 must start with TITLE:):",
    "TITLE: <specific descriptive title>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildBodyStreamPrompt(input: {
  action: StructuredGenerationAction;
  title: string;
  prompt?: string;
  tone?: AiTone;
  detailLevel?: AiDetailLevel;
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
}) {
  const workspaceLine = input.workspaceName
    ? `Product: ${input.workspaceName}`
    : "";
  const sourcePostsBlock = input.sourcePosts?.length
    ? formatSourcePostsBlock(input.sourcePosts)
    : "";
  const detailLevel = input.detailLevel ?? "detailed";

  return [
    "Write the full changelog body in GitHub-flavored Markdown.",
    "Use ## headings and bullet lists. Do not repeat the title as # heading.",
    TONE_GUIDANCE[input.tone ?? "user-friendly"],
    DETAIL_GUIDANCE[detailLevel],
    CHANGELOG_BODY_STRUCTURE,
    workspaceLine,
    `Title: ${input.title}`,
    sourcePostsBlock,
    input.prompt?.trim() ? `Notes: ${input.prompt.trim()}` : "",
    "Output format: markdown body only.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Legacy JSON-oriented prompts used by the deprecated aiAssist RPC. */
export function buildJsonAiUserPrompt(input: PromptInput) {
  const { titleLine, contentBlock, workspaceLine, sourcePostsBlock } =
    sharedContext(input);
  const itemCount = input.sourcePosts?.length ?? 0;
  const detailLevel = input.detailLevel ?? "detailed";

  switch (input.action) {
    case "prompt":
      return [
        "Write a polished changelog entry based on the prompt below.",
        "Return JSON with title, contentMarkdown, and summary keys.",
        DETAIL_GUIDANCE.detailed,
        CHANGELOG_BODY_STRUCTURE,
        TONE_GUIDANCE[input.tone ?? "user-friendly"],
        workspaceLine,
        titleLine ? `Current title (if helpful): ${titleLine}` : "",
        "Prompt:",
        input.prompt || "",
      ]
        .filter(Boolean)
        .join("\n\n");
    case "generateFromPosts":
      return [
        `Write a polished changelog entry covering ${itemCount} shipped feedback item${itemCount === 1 ? "" : "s"}.`,
        "Return JSON with title, contentMarkdown, and summary keys.",
        DETAIL_GUIDANCE[detailLevel],
        CHANGELOG_BODY_STRUCTURE,
        TONE_GUIDANCE[input.tone ?? "user-friendly"],
        workspaceLine,
        sourcePostsBlock,
        input.prompt?.trim()
          ? `Additional instructions from the author:\n${input.prompt.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    case "format":
    case "improve":
    case "expand":
      return [
        buildStreamRefineUserPrompt(input),
        "Return JSON with contentMarkdown only.",
      ].join("\n\n");
    case "summary":
      return [
        buildStreamRefineUserPrompt(input),
        "Return JSON with summary only.",
      ].join("\n\n");
    default:
      return "";
  }
}
