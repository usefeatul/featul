import { and, eq } from "drizzle-orm";
import { db, helpArticle, helpCollection, workspace } from "../../index";
import { ARTICLES, COLLECTIONS } from "./content";

/**
 * Fills a workspace's help center with mock collections and articles so the
 * portal and admin views can be reviewed with realistic content.
 * Re-runnable: rows are matched by slug and updated in place.
 *
 *   bun scripts/help/seed.ts <workspaceId>
 */

type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  text?: string;
  marks?: Mark[];
};

function inline(source: string): Node[] {
  const out: Node[] = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const m of source.matchAll(re)) {
    if (m.index > last) out.push({ type: "text", text: source.slice(last, m.index) });
    if (m[1]) out.push({ type: "text", text: m[1], marks: [{ type: "bold" }] });
    else if (m[2]) out.push({ type: "text", text: m[2], marks: [{ type: "code" }] });
    else
      out.push({
        type: "text",
        text: m[3],
        marks: [{ type: "link", attrs: { href: m[4], target: m[4]!.startsWith("/") ? null : "_blank" } }],
      });
    last = m.index + m[0].length;
  }
  if (last < source.length) out.push({ type: "text", text: source.slice(last) });
  return out;
}

const paragraph = (text: string): Node => ({ type: "paragraph", content: inline(text) });

function cells(row: string) {
  return row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}

/** Small markdown subset → Tiptap JSON: headings, lists, quotes, fenced code, pipe tables, bold/code/links. */
function toDoc(markdown: string): Node {
  const lines = markdown.replace(/^\n+|\s+$/g, "").split("\n");
  const content: Node[] = [];
  let i = 0;
  const collect = (test: RegExp) => {
    const block: string[] = [];
    while (i < lines.length && test.test(lines[i]!)) block.push(lines[i++]!);
    return block;
  };

  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      content.push({ type: "heading", attrs: { level: heading[1]!.length }, content: inline(heading[2]!) });
      i++;
    } else if (line.startsWith("```")) {
      const language = line.slice(3).trim() || null;
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) code.push(lines[i++]!);
      i++;
      content.push({ type: "codeBlock", attrs: { language }, content: [{ type: "text", text: code.join("\n") }] });
    } else if (line.startsWith(">")) {
      const quote = collect(/^>/).map((l) => l.replace(/^>\s?/, ""));
      content.push({
        type: "blockquote",
        content: quote.join("\n").split(/\n\s*\n/).map((p) => paragraph(p.replace(/\n/g, " "))),
      });
    } else if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const items = collect(ordered ? /^\d+\.\s/ : /^[-*]\s/).map((l) => l.replace(/^([-*]|\d+\.)\s+/, ""));
      content.push({
        type: ordered ? "orderedList" : "bulletList",
        content: items.map((item) => ({ type: "listItem", content: [paragraph(item)] })),
      });
    } else if (line.startsWith("|")) {
      const rows = collect(/^\|/).filter((r) => !/^\|[\s:|-]+\|$/.test(r));
      content.push({
        type: "table",
        content: rows.map((row, r) => ({
          type: "tableRow",
          content: cells(row).map((cell) => ({
            type: r === 0 ? "tableHeader" : "tableCell",
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [paragraph(cell)],
          })),
        })),
      });
    } else {
      const text: string[] = [];
      while (i < lines.length && lines[i]!.trim() && !/^(#{1,3}\s|```|>|[-*]\s|\d+\.\s|\|)/.test(lines[i]!)) {
        text.push(lines[i++]!.trim());
      }
      content.push(paragraph(text.join(" ")));
    }
  }
  return { type: "doc", content };
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

async function main() {
  const workspaceId = process.argv[2] || process.env.HELP_WORKSPACE_ID;
  if (!workspaceId) throw new Error("Usage: bun scripts/help/seed.ts <workspaceId>");

  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);
  if (!ws) throw new Error(`Workspace ${workspaceId} not found`);

  const collectionIds = new Map<string, string>();
  for (const [position, c] of COLLECTIONS.entries()) {
    const [existing] = await db
      .select({ id: helpCollection.id })
      .from(helpCollection)
      .where(and(eq(helpCollection.workspaceId, ws.id), eq(helpCollection.slug, c.slug)))
      .limit(1);
    if (existing) {
      // Existing collections keep their name and description; only their order is set.
      await db.update(helpCollection).set({ position }).where(eq(helpCollection.id, existing.id));
      collectionIds.set(c.slug, existing.id);
    } else {
      const [row] = await db
        .insert(helpCollection)
        .values({ workspaceId: ws.id, name: c.name, slug: c.slug, description: c.description, icon: c.icon, position })
        .returning({ id: helpCollection.id });
      collectionIds.set(c.slug, row!.id);
    }
  }

  const positions = new Map<string, number>();
  for (const a of ARTICLES) {
    const position = positions.get(a.collection ?? "") ?? 0;
    positions.set(a.collection ?? "", position + 1);
    const status = a.draft ? "draft" : "published";
    const values = {
      title: a.title,
      summary: a.summary,
      content: toDoc(a.body) as Record<string, unknown>,
      collectionId: a.collection ? collectionIds.get(a.collection)! : null,
      status: status as "draft" | "published",
      position,
      viewCount: a.views,
      helpfulCount: Math.round(a.views * 0.12),
      notHelpfulCount: Math.round(a.views * 0.015),
      publishedAt: a.draft ? null : daysAgo(a.age),
    };
    await db
      .insert(helpArticle)
      .values({ ...values, workspaceId: ws.id, slug: a.slug, authorId: ws.ownerId, createdAt: daysAgo(a.age) })
      .onConflictDoUpdate({ target: [helpArticle.workspaceId, helpArticle.slug], set: values });
  }

  console.log(`Seeded ${COLLECTIONS.length} collections and ${ARTICLES.length} articles into "${ws.name}".`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
