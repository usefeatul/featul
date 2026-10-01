import type { AiChatIntent } from "@featul/api/ai/types";

// Only route explicit workspace-tag operations locally. The model interprets
// writing requests and follow-ups with the draft and conversation in context.
export function detectChatIntent(input: { text: string }): AiChatIntent {
  const text = input.text.trim();
  const tags =
    /\b(?:suggest|recommend|choose|pick|apply|add|remove|clear|find|which|what)\b.{0,45}\b(?:workspace\s+)?tags?\b/i.test(
      text,
    );
  const body =
    /\b(?:sentence|paragraph|section|heading|word|mention|explain|describe|changelog about)\b/i.test(
      text,
    );
  return tags && !body ? "tags" : "conversation";
}

export function extractGithubUrls(text: string) {
  const matches = text.match(/https?:\/\/github\.com\/[^\s)]+/gi) ?? [];
  return Array.from(
    new Set(matches.map((url) => url.replace(/[.,;:]+$/, "")).filter(Boolean)),
  ).slice(0, 10);
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function isWithinPastWeek(value: string | Date | null | undefined) {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= WEEK_MS;
}
