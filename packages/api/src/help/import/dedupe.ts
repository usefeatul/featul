import { HELP_COLLECTION_ICONS } from "../../validators/help";
import type { HelpProposal } from "./generate";

/** Words that don't change what an article is about, so "How to invite your team" ≈ "Inviting team members". */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with", "by", "at", "from", "into", "up",
  "how", "what", "why", "when", "where", "which", "do", "does", "can", "i", "you", "your", "our", "my",
  "is", "are", "be", "using", "use", "guide", "faq", "faqs", "about", "overview", "introduction", "intro",
  "new", "set", "setting", "member", "members", "account", "step", "steps",
]);

/** Rough stem so plurals and verb forms line up ("invites" / "inviting" / "invite" → "invit"). */
function stem(word: string) {
  let w = word;
  if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`;
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  if (w.length > 4 && w.endsWith("e")) w = w.slice(0, -1);
  // "getting" → "gett" → "get"
  if (w.length > 3 && w.at(-1) === w.at(-2)) w = w.slice(0, -1);
  return w;
}

const words = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

/** `ignore` drops words every title shares, like the product's own name. */
export function titleTokens(title: string, ignore: Set<string> = new Set()) {
  const all = words(title);
  const content = all.filter((w) => !STOP_WORDS.has(w));
  const meaningful = content.filter((w) => !ignore.has(w));
  // "What is Featul?" is only the product's name; anything else still needs something to compare.
  return new Set((meaningful.length ? meaningful : content.length ? content : all).map(stem));
}

/** Same topic when the titles share most of their meaningful words. */
export function sameTopic(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return false;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared) >= 0.7;
}

/** Remembers titles already in the help center (or already accepted) and spots repeats. */
export function createTitleIndex(titles: string[], productName?: string | null) {
  const ignore = new Set(productName ? words(productName) : []);
  const seen = titles.map((title) => titleTokens(title, ignore));
  return {
    has: (title: string) => {
      const tokens = titleTokens(title, ignore);
      return seen.some((other) => sameTopic(tokens, other));
    },
    add: (title: string) => {
      seen.push(titleTokens(title, ignore));
    },
  };
}

type ExistingCollection = { name: string; description: string | null; icon: string };
type ProposalCollection = HelpProposal["collections"][number];

const toProposalCollection = (col: ExistingCollection): ProposalCollection => ({
  name: col.name,
  description: col.description ?? "",
  icon: (HELP_COLLECTION_ICONS as readonly string[]).includes(col.icon) ? (col.icon as ProposalCollection["icon"]) : "book",
});

/**
 * Makes a re-scan additive: drops drafts that repeat an existing article (or each other),
 * files drafts under the existing collection they name, and keeps only collections in use.
 */
export function dedupeProposal(
  proposal: HelpProposal,
  existing: { titles: string[]; collections: ExistingCollection[]; productName?: string | null },
): HelpProposal & { skipped: number } {
  const index = createTitleIndex(existing.titles, existing.productName);
  const existingByKey = new Map(existing.collections.map((col) => [col.name.trim().toLowerCase(), col]));

  const articles: HelpProposal["articles"] = [];
  for (const article of proposal.articles) {
    if (index.has(article.title)) continue;
    index.add(article.title);
    const match = existingByKey.get(article.collection.trim().toLowerCase());
    articles.push(match ? { ...article, collection: match.name } : article);
  }

  const used = new Set(articles.map((a) => a.collection.trim().toLowerCase()).filter(Boolean));
  const collections: ProposalCollection[] = [];
  const listed = new Set<string>();
  const addCollection = (col: ProposalCollection) => {
    const key = col.name.trim().toLowerCase();
    if (!used.has(key) || listed.has(key)) return;
    listed.add(key);
    collections.push(col);
  };
  for (const col of proposal.collections) {
    const match = existingByKey.get(col.name.trim().toLowerCase());
    addCollection(match ? toProposalCollection(match) : col);
  }
  // The model may file a draft under an existing collection without listing it.
  for (const col of existing.collections) addCollection(toProposalCollection(col));

  return {
    collections: collections.slice(0, 8),
    articles,
    skipped: proposal.articles.length - articles.length,
  };
}
