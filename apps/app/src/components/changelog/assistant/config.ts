import {
  AlignLeft,
  ClipboardCheck,
  ListChecks,
  Sparkles,
  Tags,
  Wand2,
} from "@/components/global/icons";
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
  intent: "conversation" | "ask" | "rewrite" | "patch" | "tags";
  hadContent: boolean;
  title?: string;
  sourceCount: number;
  reply?: string;
  summaryUpdated?: boolean;
  suggestedTags?: string[];
  selectedTagNames?: string[];
}) {
  if (input.reply) return input.reply;
  if (input.intent === "ask" || input.intent === "conversation") {
    return "I couldn't finish that response. Please try again.";
  }
  if (input.summaryUpdated) {
    return "Added the summary.";
  }
  if (input.intent === "tags") {
    if (!input.suggestedTags?.length) {
      if (input.selectedTagNames?.length) {
        const selected = input.selectedTagNames
          .map((tag) => `“${tag}”`)
          .join(", ");
        return `This entry already has ${selected}. None of the other tags look like a close fit.`;
      }
      return "None of the available tags look like a close fit for this entry.";
    }
    const tags = input.suggestedTags.map((tag) => `“${tag}”`).join(", ");
    const pronoun = input.suggestedTags.length === 1 ? "it" : "them";
    return `${tags} could fit this entry. Want me to add ${pronoun}?`;
  }
  if (input.intent === "patch") {
    return "Updated the selected text.";
  }
  if (!input.hadContent && input.sourceCount > 0) {
    const countLabel = `${input.sourceCount} shipped item${input.sourceCount === 1 ? "" : "s"}`;
    return input.title
      ? `Drafted “${input.title}” from ${countLabel}.`
      : `Drafted the entry from ${countLabel}.`;
  }
  if (!input.hadContent) {
    return input.title
      ? `Drafted “${input.title}”.`
      : "The draft is ready in the editor.";
  }
  return "Updated the draft.";
}
