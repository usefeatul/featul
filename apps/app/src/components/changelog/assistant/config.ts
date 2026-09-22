import {
  AlignLeft,
  ClipboardCheck,
  ListChecks,
  Sparkles,
  Tags,
  Wand2,
} from "lucide-react";
import type { AssistantAction } from "./actions";

export type AtQuery = {
  start: number;
  query: string;
};

export const STARTERS: AssistantAction[] = [
  {
    label: "Improve writing",
    prompt:
      "Could you improve the writing in this changelog while keeping the original meaning?",
    icon: Wand2,
  },
  {
    label: "Fix formatting",
    prompt:
      "Could you clean up the formatting and make this changelog easier to read without changing its meaning?",
    icon: AlignLeft,
  },
  {
    label: "Suggest tags",
    prompt:
      "Could you suggest a few existing workspace tags that would fit this changelog?",
    icon: Tags,
  },
  {
    label: "Add summary",
    prompt:
      "Could you add a short, natural opening summary that explains the main benefit to users?",
    icon: ListChecks,
  },
  {
    label: "Draft from feedback",
    prompt: "Could you draft a changelog from the feedback I attach?",
    attachFeedback: true,
    icon: Sparkles,
  },
  {
    label: "Publish check",
    prompt:
      "Could you review this changelog and tell me what I should improve before publishing it?",
    publishCheck: true,
    icon: ClipboardCheck,
  },
];

export function nextId() {
  return crypto.randomUUID();
}

export function withoutEmDash(value: string) {
  return value
    .replace(/\bDone\s*[—–]\s*/g, "Done. ")
    .replace(/\s*[—–]\s*/g, "; ");
}

export function getAtQuery(value: string, caret: number): AtQuery | null {
  const before = value.slice(0, caret);
  const match = before.match(/(^|[\s])@([^\n@]*)$/);
  if (!match) return null;

  const query = match[2] ?? "";
  if (query.includes("  ")) return null;

  return {
    start: before.length - query.length - 1,
    query,
  };
}

export function assistantCopy(input: {
  intent: "ask" | "rewrite" | "patch" | "tags";
  hadContent: boolean;
  title?: string;
  sourceCount: number;
  reply?: string;
  summaryUpdated?: boolean;
  suggestedTags?: string[];
  selectedTagNames?: string[];
}) {
  if (input.intent === "ask") {
    return withoutEmDash(input.reply || "Here is what I noticed.");
  }
  if (input.summaryUpdated) {
    return input.reply
      ? `I added this summary:\n\n${input.reply}`
      : "I added a summary without changing the changelog body.";
  }
  if (input.intent === "tags") {
    if (!input.suggestedTags?.length) {
      if (input.selectedTagNames?.length) {
        const selected = input.selectedTagNames
          .map((tag) => `“${tag}”`)
          .join(", ");
        return `This changelog already has ${selected}. I checked the remaining workspace tags, but I could not find another one that fits closely enough.`;
      }
      return "I checked the tags already available in this workspace, but I could not find one that fits this changelog closely enough. Would you like to leave it untagged for now?";
    }
    const tags = input.suggestedTags.map((tag) => `“${tag}”`).join(", ");
    const subject = input.suggestedTags.length === 1 ? "tag" : "tags";
    const pronoun = input.suggestedTags.length === 1 ? "it" : "them";
    return `I found the existing workspace ${subject} ${tags}, which looks like a good fit for this changelog. Would you like me to add ${pronoun}?`;
  }
  if (input.intent === "patch") {
    return (
      input.reply ||
      "I have updated only the selected text. Would you like me to make it warmer, shorter, or more technical?"
    );
  }
  if (!input.hadContent && input.sourceCount > 0) {
    const countLabel = `${input.sourceCount} shipped item${input.sourceCount === 1 ? "" : "s"}`;
    return input.title
      ? `I have drafted “${input.title}” from ${countLabel}. Would you like to refine the tone or level of detail?`
      : `I have drafted the changelog from ${countLabel}. Would you like to refine the tone or level of detail?`;
  }
  if (!input.hadContent) {
    return input.title
      ? `I have written a draft titled “${input.title}”. Would you like me to refine anything else?`
      : "I have written a draft in the editor. Would you like me to refine anything else?";
  }
  if (input.reply) return input.reply;
  return "I have updated the changelog while keeping the original meaning. Would you like me to refine anything else?";
}
