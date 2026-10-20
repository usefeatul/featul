import { ImportFetchError, safeFetchText } from "./fetch";
import type { ImportSource } from "./site";

/** owner/repo from a GitHub URL or shorthand; anything else is rejected. */
export function parseGithubRepo(raw: string): { owner: string; repo: string } | null {
  const trimmed = raw.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const match =
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]{1,39})\/([A-Za-z0-9._-]{1,100})(?:\/.*)?$/.exec(trimmed) ??
    /^([A-Za-z0-9-]{1,39})\/([A-Za-z0-9._-]{1,100})$/.exec(trimmed);
  return match ? { owner: match[1]!, repo: match[2]! } : null;
}

// Contributor and tooling docs say little about using the product.
const SKIP_FILE = /(code_of_conduct|contributing|publish|cicd|ci\.md|security|agents|claude|changelog|license|pull_request|issue_template|maintain)/i;
const PREFER_FILE = /(getting.?started|quick.?start|install|usage|guide|faq|overview|introduction|features|configuration)/i;

const FILE_CHARS = 6_000;

async function githubJson<T>(path: string): Promise<T | null> {
  const res = await safeFetchText(`https://api.github.com${path}`, {
    accept: "application/vnd.github+json",
    maxBytes: 4_000_000,
  });
  if (!res) return null;
  try {
    return JSON.parse(res.text) as T;
  } catch {
    return null;
  }
}

/**
 * Reads a public GitHub repo: its description, README, and the few Markdown docs most likely
 * to explain the product. Private repos aren't supported yet.
 */
export async function readRepo(
  raw: string,
  maxFiles: number,
  onFile: (source: ImportSource) => void,
): Promise<ImportSource[]> {
  const parsed = parseGithubRepo(raw);
  if (!parsed) throw new ImportFetchError("Enter a GitHub repository like github.com/owner/repo");
  const { owner, repo } = parsed;
  const meta = await githubJson<{
    full_name: string;
    description: string | null;
    homepage: string | null;
    topics?: string[];
    default_branch: string;
    private: boolean;
  }>(`/repos/${owner}/${repo}`);
  if (!meta) throw new ImportFetchError(`Couldn't open github.com/${owner}/${repo}. Is it public?`);

  const tree = await githubJson<{ tree: Array<{ path: string; type: string; size?: number }> }>(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`,
  );
  const docs = (tree?.tree ?? [])
    .filter((f) => f.type === "blob" && /\.(md|mdx)$/i.test(f.path) && !SKIP_FILE.test(f.path))
    .filter((f) => !/(^|\/)(\.[^/]+|node_modules|integration|templates?|test|tests|__tests__|fixtures|examples?|playground)\//i.test(f.path))
    .map((f) => {
      const depth = f.path.split("/").length;
      const score =
        (/^readme\.mdx?$/i.test(f.path) ? 100 : 0) +
        (/^docs?\//i.test(f.path) ? 6 : 0) +
        (PREFER_FILE.test(f.path) ? 5 : 0) +
        (/readme\.mdx?$/i.test(f.path) ? 2 : 0) -
        depth;
      return { path: f.path, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, maxFiles));

  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(meta.default_branch)}/`;
  const files = await Promise.all(
    docs.map(async (doc) => ({ doc, res: await safeFetchText(base + doc.path, { accept: "text/plain" }) })),
  );

  const header = [meta.description, meta.homepage ? `Website: ${meta.homepage}` : "", meta.topics?.length ? `Topics: ${meta.topics.join(", ")}` : ""]
    .filter(Boolean)
    .join("\n");
  const sources: ImportSource[] = [];
  files.forEach(({ doc, res }, index) => {
    if (!res) return;
    const text = res.text
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/<img[^>]*>/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const source: ImportSource = {
      kind: "repo",
      url: `https://github.com/${owner}/${repo}/blob/${meta.default_branch}/${doc.path}`,
      title: `${meta.full_name} · ${doc.path}`,
      text: (index === 0 && header ? `${header}\n\n${text}` : text).slice(0, FILE_CHARS),
    };
    if (source.text.length < 150) return;
    sources.push(source);
    onFile(source);
  });
  return sources;
}
