import { z } from "zod";
import { resolveOpenRouterStreamModel, streamOpenRouterChat } from "../../services/openrouter";
import { HELP_COLLECTION_ICONS } from "../../validators/help";
import type { ImportSource } from "./site";

export const proposalSchema = z.object({
  collections: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        description: z.string().trim().max(240).optional().default(""),
        icon: z.enum(HELP_COLLECTION_ICONS).catch("book"),
      }),
    )
    .max(8),
  articles: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        summary: z.string().trim().max(300).optional().default(""),
        collection: z.string().trim().max(80).optional().default(""),
        body: z.string().trim().min(1).max(20_000),
        sources: z.array(z.string().url()).max(10).optional().default([]),
      }),
    )
    .max(30),
});

export type HelpProposal = z.infer<typeof proposalSchema>;

const SOURCE_BUDGET = 70_000;

function buildPrompt(input: {
  workspaceName: string;
  maxArticles: number;
  sources: ImportSource[];
  existingTitles: string[];
}) {
  const system = [
    `You write the first help center for ${input.workspaceName}. Readers are ${input.workspaceName}'s customers, not its engineers or contributors.`,
    `Write up to ${input.maxArticles} articles covering what a new customer needs most, in this order: what the product is, getting started, the core features, plans and billing when pricing is in the sources, and common questions.`,
    "Group them into 2 to 5 collections. Every collection must hold at least one of your articles.",
    "Use only facts in the sources. Never invent prices, limits, URLs, settings names or steps. Leave out any topic the sources don't support.",
    "Write each body in Markdown, 150 to 400 words: a one-line intro, then ## sections, short paragraphs, '- ' lists and '1.' steps. No H1, no images, no HTML, no code blocks longer than 6 lines.",
    "Write in second person, plainly, without marketing language.",
    `Give each collection one icon from: ${HELP_COLLECTION_ICONS.join(", ")}.`,
    "List the source URLs each article relies on in its sources array.",
    'Reply with JSON only, no prose and no code fences: {"collections":[{"name":"","description":"","icon":""}],"articles":[{"title":"","summary":"","collection":"","body":"","sources":[""]}]}',
  ].join("\n");

  let budget = SOURCE_BUDGET;
  const blocks: string[] = [];
  input.sources.forEach((source, index) => {
    if (budget <= 0) return;
    const text = source.text.slice(0, budget);
    budget -= text.length;
    blocks.push(`### Source ${index + 1} (${source.kind}): ${source.title}\nURL: ${source.url}\n\n${text}`);
  });
  const existing = input.existingTitles.length
    ? `\n\nArticles that already exist (don't duplicate them):\n${input.existingTitles.map((t) => `- ${t}`).join("\n")}`
    : "";
  return { system, user: `${blocks.join("\n\n---\n\n")}${existing}` };
}

/** Pulls the outermost JSON object out of a reply that may carry stray text or fences. */
function extractJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The draft came back empty. Please try again.");
  return JSON.parse(raw.slice(start, end + 1));
}

/**
 * Drafts a proposal from scanned sources. `onArticle` fires as each article title streams in,
 * so the UI can count progress before the whole reply is parsed.
 */
export async function draftHelpCenter(input: {
  workspaceName: string;
  maxArticles: number;
  sources: ImportSource[];
  existingTitles: string[];
  signal?: AbortSignal;
  onArticle?: (title: string) => void;
}): Promise<HelpProposal> {
  const { system, user } = buildPrompt(input);
  let raw = "";
  let reported = 0;
  await streamOpenRouterChat(
    {
      model: resolveOpenRouterStreamModel(),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: Math.min(32_000, 1_400 * input.maxArticles + 1_200),
    },
    (text) => {
      raw += text;
      const titles = [...raw.matchAll(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
      while (reported < titles.length) {
        input.onArticle?.(JSON.parse(`"${titles[reported]![1]}"`) as string);
        reported++;
      }
    },
    input.signal,
  );
  const proposal = proposalSchema.parse(extractJson(raw));
  return { ...proposal, articles: proposal.articles.slice(0, input.maxArticles) };
}
