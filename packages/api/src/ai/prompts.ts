import {
  AI_STREAM_ASK_SYSTEM_PROMPT,
  AI_STREAM_PATCH_SYSTEM_PROMPT,
  AI_STREAM_REFINE_SYSTEM_PROMPT,
  CHANGELOG_BODY_STRUCTURE,
  DETAIL_GUIDANCE,
  TONE_GUIDANCE,
} from "./constants";
import { formatSourcePostsBlock } from "./sources";
import type {
  AiAction,
  AiChatMessage,
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
  brandVoice?: string;
  githubUrls?: string[];
  availableTagNames?: string[];
};

function extraContext(input: {
  brandVoice?: string;
  githubUrls?: string[];
  availableTagNames?: string[];
  sourcePosts?: AiSourcePost[];
}) {
  const brandVoice = input.brandVoice?.trim()
    ? `Match this product's published changelog voice:\n${input.brandVoice.trim()}`
    : "";
  const githubUrls = input.githubUrls?.length
    ? `GitHub sources:\n${input.githubUrls.join("\n")}`
    : "";
  const tags = input.availableTagNames?.length
    ? `If tags fit, end the markdown with a final line: TAGS: ${input.availableTagNames.slice(0, 12).join(", ")}`
    : "";
  const feedbackLinks = input.sourcePosts?.some((post) => post.slug)
    ? "If covering attached feedback, end with a ## Feedback section listing markdown links using /board/p/{slug} for each item."
    : "";

  return { brandVoice, githubUrls, tags, feedbackLinks };
}

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
  brandVoice?: string;
  githubUrls?: string[];
  availableTagNames?: string[];
}) {
  const workspaceLine = input.workspaceName
    ? `Product: ${input.workspaceName}`
    : "";
  const sourcePostsBlock = input.sourcePosts?.length
    ? formatSourcePostsBlock(input.sourcePosts)
    : "";
  const detailLevel = input.detailLevel ?? "detailed";
  const extra = extraContext(input);

  return [
    "Write the full changelog body in GitHub-flavored Markdown.",
    "Use ## headings and bullet lists. Do not repeat the title as # heading.",
    TONE_GUIDANCE[input.tone ?? "user-friendly"],
    DETAIL_GUIDANCE[detailLevel],
    CHANGELOG_BODY_STRUCTURE,
    extra.brandVoice,
    extra.feedbackLinks,
    extra.tags,
    extra.githubUrls,
    workspaceLine,
    `Title: ${input.title}`,
    sourcePostsBlock,
    input.prompt?.trim() ? `Notes: ${input.prompt.trim()}` : "",
    "Output format: markdown body only.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildChatRefineOpenRouterMessages(input: {
  prompt: string;
  title?: string;
  contentMarkdown?: string;
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
  history?: AiChatMessage[];
  brandVoice?: string;
  githubUrls?: string[];
  availableTagNames?: string[];
}) {
  const extra = extraContext(input);
  const context = [
    "Apply the user's latest request to this changelog entry.",
    "Return ONLY the full updated GitHub-flavored Markdown body.",
    "If they only asked to change the title or tags, keep the body the same.",
    "You may start with TITLE: a new title, and end with TAGS: matching available tags.",
    "Do not include a chat reply or commentary.",
    extra.brandVoice,
    extra.feedbackLinks,
    extra.tags,
    extra.githubUrls,
    input.workspaceName ? `Product: ${input.workspaceName}` : "",
    input.title?.trim() ? `Current title: ${input.title.trim()}` : "",
    input.contentMarkdown?.trim()
      ? `Current entry:\n${input.contentMarkdown.trim()}`
      : "The entry is currently empty.",
    input.sourcePosts?.length
      ? `Attached feedback:\n${formatSourcePostsBlock(input.sourcePosts)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const history = (input.history ?? []).slice(-12).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 1500),
  }));

  return [
    { role: "system" as const, content: AI_STREAM_REFINE_SYSTEM_PROMPT },
    { role: "user" as const, content: context },
    ...history,
    { role: "user" as const, content: input.prompt.trim() },
  ];
}

export function buildChatAskOpenRouterMessages(input: {
  prompt: string;
  title?: string;
  contentMarkdown?: string;
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
  history?: AiChatMessage[];
  githubUrls?: string[];
}) {
  const extra = extraContext(input);
  const context = [
    "The author is asking a question about this draft. Answer in chat. Do not rewrite the entry.",
    extra.githubUrls,
    input.workspaceName ? `Product: ${input.workspaceName}` : "",
    input.title?.trim() ? `Current title: ${input.title.trim()}` : "",
    input.contentMarkdown?.trim()
      ? `Current entry:\n${input.contentMarkdown.trim()}`
      : "The entry is currently empty.",
    input.sourcePosts?.length
      ? `Attached feedback:\n${formatSourcePostsBlock(input.sourcePosts)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const history = (input.history ?? []).slice(-12).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 1500),
  }));

  return [
    { role: "system" as const, content: AI_STREAM_ASK_SYSTEM_PROMPT },
    { role: "user" as const, content: context },
    ...history,
    { role: "user" as const, content: input.prompt.trim() },
  ];
}

export function buildChatPatchOpenRouterMessages(input: {
  prompt: string;
  title?: string;
  contentMarkdown?: string;
  selectionMarkdown: string;
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
  history?: AiChatMessage[];
  brandVoice?: string;
}) {
  const extra = extraContext(input);
  const context = [
    "Rewrite only the selected excerpt. Return replacement markdown for that excerpt.",
    extra.brandVoice,
    input.workspaceName ? `Product: ${input.workspaceName}` : "",
    input.title?.trim() ? `Current title: ${input.title.trim()}` : "",
    input.contentMarkdown?.trim()
      ? `Full entry (for context only):\n${input.contentMarkdown.trim()}`
      : "",
    `Selected excerpt to replace:\n${input.selectionMarkdown.trim()}`,
    input.sourcePosts?.length
      ? `Attached feedback:\n${formatSourcePostsBlock(input.sourcePosts)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const history = (input.history ?? []).slice(-8).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 800),
  }));

  return [
    { role: "system" as const, content: AI_STREAM_PATCH_SYSTEM_PROMPT },
    { role: "user" as const, content: context },
    ...history,
    { role: "user" as const, content: input.prompt.trim() },
  ];
}

/** Legacy JSON-oriented prompts used by the deprecated aiAssist RPC. */
export function buildJsonAiUserPrompt(input: PromptInput) {
  const { titleLine, contentBlock, workspaceLine, sourcePostsBlock } =
    sharedContext(input);
  const itemCount = input.sourcePosts?.length ?? 0;
  const detailLevel = input.detailLevel ?? "detailed";

  switch (input.action) {
    case "prompt":
    case "chat":
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
