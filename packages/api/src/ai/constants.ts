import type { AiAction, AiDetailLevel, AiTone } from "./types";

export const SHIPPABLE_ROADMAP_STATUSES = ["completed", "progress"] as const;

export const AI_STREAM_TITLE_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY one TITLE line in the requested format.",
  "The title must be specific, descriptive, and 5-12 words.",
  "Never use generic titles like 'Product update', 'Release', or single-word titles.",
  "Start line 1 with TITLE: immediately. No preamble.",
].join(" ");

export const AI_STREAM_BODY_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY the markdown body. No TITLE, SUMMARY, JSON, or fences.",
  "Use GitHub-flavored Markdown with ## headings and bullet lists.",
].join(" ");

export const AI_STREAM_REFINE_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY the requested markdown output. No JSON, fences, or commentary.",
].join(" ");

export const AI_STREAM_SUMMARY_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY a 2-3 sentence summary (<= 512 characters) with no quotes or labels.",
].join(" ");

export const CHANGELOG_BODY_STRUCTURE = [
  "Use this Markdown structure:",
  "1. Opening paragraph: set context and summarize what shipped.",
  "2. For each major update, add an ## heading.",
  "3. Under each heading include:",
  "   - A paragraph on what changed and why users care",
  "   - A bullet list with 2-4 concrete improvements or behaviors",
  "   - Optional short note on how to use it, if relevant",
  "4. Optional closing paragraph thanking users for feedback.",
].join("\n");

export const DETAIL_GUIDANCE: Record<AiDetailLevel, string> = {
  standard:
    "Target length: roughly 200-450 words in contentMarkdown. Be thorough but not exhaustive.",
  detailed:
    "Target length: roughly 450-900 words in contentMarkdown for multi-item releases, or 250-500 for a single item. Write a full, publish-ready entry — not a short blurb.",
};

export const TONE_GUIDANCE: Record<AiTone, string> = {
  "user-friendly":
    "Audience: end users. Use plain language, focus on outcomes and benefits, avoid internal jargon.",
  technical:
    "Audience: technical users. Include implementation details, APIs, settings, or constraints where helpful.",
  brief:
    "Keep the entry shorter, but still use headings and bullets. Aim for clarity over length.",
};

export const AI_TEMPERATURE_BY_ACTION: Record<AiAction, number> = {
  prompt: 0.55,
  generateFromPosts: 0.55,
  format: 0.2,
  improve: 0.35,
  expand: 0.45,
  summary: 0.2,
};

export function getMaxTokensByAction(
  action: AiAction,
  detailLevel?: AiDetailLevel,
): number {
  const limits: Partial<Record<AiAction, number>> = {
    prompt: 2200,
    generateFromPosts: detailLevel === "standard" ? 1800 : 3200,
    improve: 1600,
    expand: 2800,
    summary: 256,
  };

  return limits[action] ?? 900;
}
