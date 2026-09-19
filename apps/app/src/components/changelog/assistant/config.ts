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
      "Improve the writing. Correct grammar, tighten the wording, and keep the original meaning.",
    icon: Wand2,
  },
  {
    label: "Fix formatting",
    prompt: "Fix the formatting and structure. Keep the meaning the same.",
    icon: AlignLeft,
  },
  {
    label: "Suggest tags",
    prompt:
      "Analyze this changelog and add up to four concise, relevant tags. Create a new tag if no existing tag fits.",
    icon: Tags,
  },
  {
    label: "Add summary",
    prompt: "Add a concise opening summary that explains the user benefit.",
    icon: ListChecks,
  },
  {
    label: "Draft from feedback",
    prompt: "Write a changelog from the attached shipped feedback.",
    attachFeedback: true,
    icon: Sparkles,
  },
  {
    label: "Publish check",
    prompt: "Review this changelog for publish readiness. What should we fix?",
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
  intent: "ask" | "rewrite" | "patch";
  hadContent: boolean;
  title?: string;
  sourceCount: number;
  reply?: string;
  appliedTags?: string[];
}) {
  if (input.intent === "ask") {
    return input.reply || "Here's what I noticed.";
  }
  if (input.appliedTags?.length) {
    const tags = input.appliedTags.map((tag) => `“${tag}”`).join(", ");
    return input.intent === "patch"
      ? `Updated the selected text and added ${tags}.`
      : `Updated the entry and added ${tags}.`;
  }
  if (input.intent === "patch") {
    return "Updated the selected text. Ask if you want another pass.";
  }
  if (!input.hadContent && input.sourceCount > 0) {
    const countLabel = `${input.sourceCount} shipped item${input.sourceCount === 1 ? "" : "s"}`;
    return input.title
      ? `Drafted “${input.title}” from ${countLabel}. What should we change?`
      : `Drafted the changelog from ${countLabel}. What should we change?`;
  }
  if (!input.hadContent) {
    return input.title
      ? `Wrote a draft titled “${input.title}”. Keep chatting to refine it.`
      : "Wrote a draft into the entry. Keep chatting to refine it.";
  }
  return "Updated the entry. Ask if you want another pass.";
}
