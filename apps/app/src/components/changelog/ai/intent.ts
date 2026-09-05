import type { AiChatIntent } from "@featul/api/ai/types";

const REWRITE_RE =
  /\b(rewrite|draft|write|improve|expand|format|make it|add more|shorter|longer|technical|from feedback|this week|change the title|retitle|tag)\b/i;
const ASK_RE =
  /(\? *$)|^(what|why|how|is |are |should |does |do you|explain|review|check|what's missing|is this)/i;

export function detectChatIntent(input: {
  text: string;
  hasSelection: boolean;
}): AiChatIntent {
  const text = input.text.trim();
  const isAsk = ASK_RE.test(text);
  const isRewrite = REWRITE_RE.test(text);

  if (input.hasSelection && !isAsk) return "patch";
  if (input.hasSelection && isRewrite) return "patch";
  if (isAsk && !isRewrite) return "ask";
  return "rewrite";
}

export function extractGithubUrls(text: string) {
  const matches = text.match(/https?:\/\/github\.com\/[^\s)]+/gi) ?? [];
  return Array.from(
    new Set(
      matches.map((url) => url.replace(/[.,;:]+$/, "")).filter(Boolean),
    ),
  ).slice(0, 10);
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function isWithinPastWeek(value: string | Date | null | undefined) {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= WEEK_MS;
}
