import { normalizeSiteUrl, safeFetchText } from "./fetch";

export type ImportSource = {
  kind: "site" | "repo";
  url: string;
  title: string;
  text: string;
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Readable text from an HTML page: drops scripts, chrome and markup, keeps headings and lists. */
export function htmlToText(html: string) {
  const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ?? "");
  const description = decodeEntities(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i.exec(html)?.[1] ?? "",
  );
  const body = (/<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? /<body[\s\S]*<\/body>/i.exec(html)?.[0] ?? html)
    .replace(/<(script|style|noscript|svg|template|iframe|nav|footer|header|form|button)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<h([1-4])[^>]*>/gi, (_, level: string) => `\n\n${"#".repeat(Number(level))} `)
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr|br)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const text = decodeEntities(body)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 1 && line !== "-")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
  return { title, description, text };
}

// Pages that tend to explain a product to its customers rank first; marketing chaff last.
const BOOST: Array<[RegExp, number]> = [
  [/\/(pricing|plans)\b/, 6],
  [/getting-started|quickstart|quick-start|\/start\b|onboarding/, 5],
  [/\/(faq|help|support|troubleshoot)/, 4],
  [/\/(docs|guide|guides|features|product|how-it-works|overview)\b/, 3],
  [/billing|account|security|integrations?|settings|teams?|users?/, 2],
];
const SKIP = /\/(blog|changelog|news|press|careers|jobs|legal|terms|privacy|cookies?|customers|case-studies|events|webinars?|glossary|articles|compare|vs|alternatives|tag|tags|author|category|page\/\d)(\/|$)/;

function scorePath(path: string) {
  if (SKIP.test(path)) return -Infinity;
  let score = 0;
  for (const [pattern, boost] of BOOST) if (pattern.test(path)) score += boost;
  const depth = path.split("/").filter(Boolean).length;
  return score - Math.max(0, depth - 2) * 1.5;
}

/** Same-site links from a sitemap or a page, normalised and de-duplicated. */
function collectLinks(base: URL, raw: string, fromSitemap: boolean) {
  const found = new Set<string>();
  const pattern = fromSitemap ? /<loc>\s*([^<\s]+)\s*<\/loc>/gi : /href=["']([^"'#]+)["']/gi;
  for (const match of raw.matchAll(pattern)) {
    try {
      const url = new URL(decodeEntities(match[1]!), base);
      if (url.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) continue;
      if (/\.(png|jpe?g|gif|svg|webp|pdf|zip|xml|json|css|js|ico|mp4)$/i.test(url.pathname)) continue;
      url.hash = "";
      url.search = "";
      found.add(url.toString().replace(/\/$/, ""));
    } catch {
      /* ignore malformed links */
    }
  }
  return [...found];
}

/** Best pages first, at most two per section and one per leaf name, so one area can't crowd out the rest. */
function pickPages(home: URL, candidates: string[], limit: number) {
  const ranked = candidates
    .map((url) => ({ url, path: new URL(url).pathname, score: scorePath(new URL(url).pathname) }))
    .filter((c) => c.path !== "/" && c.path !== "" && Number.isFinite(c.score) && c.score > 0)
    .sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  const perSection = new Map<string, number>();
  const leaves = new Set<string>();
  const picked: string[] = [];
  for (const c of ranked) {
    const parts = c.path.split("/").filter(Boolean);
    const section = parts.slice(0, 2).join("/");
    // One page per leaf name, so ten framework quickstarts don't all make the cut.
    const leaf = parts[parts.length - 1] ?? "";
    if ((perSection.get(section) ?? 0) >= 2 || leaves.has(leaf)) continue;
    perSection.set(section, (perSection.get(section) ?? 0) + 1);
    leaves.add(leaf);
    picked.push(c.url);
    if (picked.length >= limit) break;
  }
  return [home.toString().replace(/\/$/, ""), ...picked].slice(0, limit + 1);
}

const PAGE_CHARS = 5_000;

/**
 * Reads the homepage, then the most helpful pages found through the sitemap and homepage links.
 * `onPage` reports each page as it is read so the UI can show progress.
 */
export async function readSite(
  raw: string,
  maxPages: number,
  onPage: (source: ImportSource) => void,
): Promise<ImportSource[]> {
  const home = normalizeSiteUrl(raw);
  const homePage = await safeFetchText(home.toString());
  if (!homePage) throw new Error(`Couldn't open ${home.hostname}`);
  const finalHome = new URL(homePage.url);

  const sitemap = await safeFetchText(new URL("/sitemap.xml", finalHome).toString(), {
    accept: "application/xml,text/xml,*/*;q=0.5",
    maxBytes: 3_000_000,
  });
  const candidates = [
    ...(sitemap && /<urlset|<sitemapindex/i.test(sitemap.text) ? collectLinks(finalHome, sitemap.text, true) : []),
    ...collectLinks(finalHome, homePage.text, false),
  ];
  const urls = pickPages(finalHome, [...new Set(candidates)], Math.max(0, maxPages - 1));

  const sources: ImportSource[] = [];
  const pages = await Promise.all(
    urls.map(async (url, index) => (index === 0 ? homePage : safeFetchText(url).catch(() => null))),
  );
  pages.forEach((page, index) => {
    if (!page || !/html/i.test(page.contentType || "text/html")) return;
    const { title, description, text } = htmlToText(page.text);
    const body = [description, text].filter(Boolean).join("\n\n").slice(0, PAGE_CHARS);
    if (body.length < 200) return;
    const source: ImportSource = { kind: "site", url: urls[index]!, title: title || urls[index]!, text: body };
    sources.push(source);
    onPage(source);
  });
  return sources;
}
