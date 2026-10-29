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

const draftCollectionSchema = proposalSchema.shape.collections.element.extend({
  description: z.string().trim().max(240).nullish().transform((v) => v ?? ""),
});
const draftArticleSchema = proposalSchema.shape.articles.element.extend({
  title: z.string().trim().min(1).transform((v) => v.slice(0, 200)),
  body: z.string().trim().min(1).transform((v) => v.slice(0, 20_000)),
  summary: z.string().trim().nullish().transform((v) => (v ?? "").slice(0, 300)),
  collection: z.string().trim().max(80).nullish().transform((v) => v ?? ""),
  // Models often leave an empty "" from the template; keep only real URLs.
  sources: z
    .array(z.unknown())
    .nullish()
    .transform((list) =>
      (list ?? []).filter((v): v is string => typeof v === "string" && z.string().url().safeParse(v).success).slice(0, 10),
    ),
});

/**
 * Keeps every collection and article that is valid on its own, so one malformed item from the
 * model doesn't throw away the whole draft. Collection names are de-duplicated.
 */
function parseProposal(value: unknown): HelpProposal {
  const root = (value ?? {}) as { collections?: unknown; articles?: unknown };
  const seen = new Set<string>();
  const collections = (Array.isArray(root.collections) ? root.collections : [])
    .map((item) => draftCollectionSchema.safeParse(item))
    .flatMap((result) => (result.success ? [result.data] : []))
    .filter((col) => {
      const key = col.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
  const articles = (Array.isArray(root.articles) ? root.articles : [])
    .map((item) => draftArticleSchema.safeParse(item))
    .flatMap((result) => (result.success ? [result.data] : []))
    .slice(0, 30);
  return proposalSchema.parse({ collections, articles });
}

/**
 * Constrains the reply to valid JSON. Without it the model now and then leaves a `"` unescaped
 * inside an article body, and the whole draft fails to parse.
 */
const PROPOSAL_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "help_center_draft",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["collections", "articles"],
      properties: {
        collections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "description", "icon"],
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              icon: { type: "string", enum: [...HELP_COLLECTION_ICONS] },
            },
          },
        },
        articles: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "summary", "collection", "body", "sources"],
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              collection: { type: "string" },
              body: { type: "string" },
              sources: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
  },
} as const;

const SOURCE_BUDGET = 70_000;

export type ExistingHelpContent = {
  articles: Array<{ title: string; summary: string | null; collection: string | null }>;
  collections: string[];
};

/** Keeps the list of what's already written from crowding out the sources. */
const EXISTING_LIMIT = 150;

function buildPrompt(input: {
  workspaceName: string;
  maxArticles: number;
  sources: ImportSource[];
  existing: ExistingHelpContent;
}) {
  const rescan = input.existing.articles.length > 0;
  const scope = rescan
    ? [
        `You extend the help center for ${input.workspaceName}. Readers are ${input.workspaceName}'s customers, not its engineers or contributors.`,
        `It already has ${input.existing.articles.length} articles, listed after the sources. Write only articles on topics none of them cover yet, up to ${input.maxArticles}. Never rewrite, reword, rename, split or merge an existing article, even if the sources describe it better.`,
        'If the sources hold nothing the existing articles don\'t already cover, reply with {"collections":[],"articles":[]}. Fewer new articles is better than a repeat.',
        input.existing.collections.length
          ? "File each new article under an existing collection when one fits, using its exact name. Add a new collection only when none fits. List every collection your articles use, existing or new."
          : "Group the new articles into 1 to 3 collections. Every collection must hold at least one of your articles.",
      ]
    : [
        `You write the first help center for ${input.workspaceName}. Readers are ${input.workspaceName}'s customers, not its engineers or contributors.`,
        `Write up to ${input.maxArticles} articles covering what a new customer needs most, in this order: what the product is, getting started, the core features, plans and billing when pricing is in the sources, and common questions.`,
        "Group them into 2 to 5 collections. Every collection must hold at least one of your articles.",
      ];
  const system = [
    ...scope,
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
  const listed = input.existing.articles.slice(0, EXISTING_LIMIT).map((article) => {
    const where = article.collection ? ` [${article.collection}]` : "";
    const about = article.summary?.trim() ? `: ${article.summary.trim()}` : "";
    return `- ${article.title}${where}${about}`;
  });
  const more = input.existing.articles.length - listed.length;
  const existing = rescan
    ? [
        "\n\n---\n\n## Articles that already exist. Don't write any of these topics again.",
        listed.join("\n") + (more > 0 ? `\n- …and ${more} more` : ""),
        input.existing.collections.length ? `\nExisting collections: ${input.existing.collections.join(", ")}` : "",
      ].join("\n")
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
  existing: ExistingHelpContent;
  signal?: AbortSignal;
  onArticle?: (title: string) => void;
}): Promise<HelpProposal> {
  const { system, user } = buildPrompt(input);
  let raw = "";
  // Scanning resumes after the last complete title, so each chunk only rescans the new tail.
  let scannedTo = 0;
  const titlePattern = /"title"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  await streamOpenRouterChat(
    {
      model: resolveOpenRouterStreamModel(),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: Math.min(32_000, 1_400 * input.maxArticles + 1_200),
      response_format: PROPOSAL_RESPONSE_FORMAT,
      // Only route to providers that honour the schema.
      provider: { require_parameters: true },
    },
    (text) => {
      raw += text;
      titlePattern.lastIndex = scannedTo;
      for (let match = titlePattern.exec(raw); match; match = titlePattern.exec(raw)) {
        input.onArticle?.(JSON.parse(`"${match[1]}"`) as string);
        scannedTo = titlePattern.lastIndex;
      }
    },
    input.signal,
  );
  const proposal = parseProposal(extractJson(raw));
  // An empty reply is a valid answer on a re-scan: everything was already covered.
  if (proposal.articles.length === 0 && input.existing.articles.length === 0) {
    throw new Error("The draft came back empty. Please try again.");
  }
  return { ...proposal, articles: proposal.articles.slice(0, input.maxArticles) };
}
