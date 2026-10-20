import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  helpArticle,
  helpCenter,
  helpCollection,
  user,
  workspace,
  workspaceMember,
} from "@featul/db";
import { getWorkspaceAccessPlan } from "../shared/access";
import { getPlanLimits } from "../shared/plan";

type Db = any;

export type HelpCollectionSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  position: number;
  articleCount: number;
};

export type HelpArticleLink = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  collectionId: string | null;
};

export type HelpArticleAuthor = {
  name: string | null;
  image: string | null;
  role: "admin" | "member" | "viewer" | null;
  isOwner: boolean;
  isFeatul: boolean;
};

export type PublicHelpArticle = HelpArticleLink & {
  content: Record<string, unknown>;
  updatedAt: Date;
  publishedAt: Date | null;
  author: HelpArticleAuthor;
};

export type PublicHelpWorkspace = { id: string; name: string; slug: string };

/** Public page workspace plus the plan features the page needs to render. */
export type HelpPageWorkspace = PublicHelpWorkspace & { askAi: boolean };

/** Every public collection with its published article links, in display order. */
export type HelpTree = {
  collections: Array<HelpCollectionSummary & { articles: HelpArticleLink[] }>;
  uncategorized: HelpArticleLink[];
};

export type HelpHomeData = HelpTree & {
  workspace: HelpPageWorkspace;
  popular: Array<HelpArticleLink & { collectionName: string | null }>;
};

export type HelpCollectionPageData = {
  workspace: HelpPageWorkspace;
  collection: HelpCollectionSummary;
  articles: HelpArticleLink[];
  tree: HelpTree;
};

export type HelpArticlePageData = {
  workspace: HelpPageWorkspace;
  article: PublicHelpArticle;
  collection: HelpCollectionSummary | null;
  siblings: HelpArticleLink[];
  tree: HelpTree;
  previous: HelpArticleLink | null;
  next: HelpArticleLink | null;
};

const published = eq(helpArticle.status, "published");

const linkColumns = {
  id: helpArticle.id,
  title: helpArticle.title,
  slug: helpArticle.slug,
  summary: helpArticle.summary,
  collectionId: helpArticle.collectionId,
};

const articleOrder = [asc(helpArticle.position), asc(helpArticle.createdAt)];

/** Explicitly hidden only; a missing settings row counts as visible. */
export async function isHelpCenterEnabled(db: Db, workspaceId: string) {
  const [row] = await db
    .select({ isVisible: helpCenter.isVisible })
    .from(helpCenter)
    .where(eq(helpCenter.workspaceId, workspaceId))
    .limit(1);
  return row ? Boolean(row.isVisible) : true;
}

export async function countPublishedHelpArticles(db: Db, workspaceId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(helpArticle)
    .where(and(eq(helpArticle.workspaceId, workspaceId), published));
  return Number(row?.count || 0);
}

/** The portal shows a Help tab only when the help center is enabled and has something to read. */
export async function isHelpCenterPublic(db: Db, workspaceId: string) {
  if (!(await isHelpCenterEnabled(db, workspaceId))) return false;
  return (await countPublishedHelpArticles(db, workspaceId)) > 0;
}

/** Workspace behind a public help center, or null when it is hidden or empty. */
export async function findPublicHelpWorkspace(
  db: Db,
  slug: string,
): Promise<PublicHelpWorkspace | null> {
  const [ws] = await db
    .select({ id: workspace.id, name: workspace.name, slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  if (!ws) return null;
  return (await isHelpCenterPublic(db, ws.id)) ? ws : null;
}

async function findHelpPageWorkspace(db: Db, slug: string): Promise<HelpPageWorkspace | null> {
  const ws = await findPublicHelpWorkspace(db, slug);
  if (!ws) return null;
  const { monthlyHelpAiAnswers } = getPlanLimits(await getWorkspaceAccessPlan(ws.id));
  return { ...ws, askAi: monthlyHelpAiAnswers > 0 };
}

/** Collections that have at least one published article, with that count. */
async function listPublicCollections(
  db: Db,
  workspaceId: string,
): Promise<HelpCollectionSummary[]> {
  const rows = await db
    .select({
      id: helpCollection.id,
      name: helpCollection.name,
      slug: helpCollection.slug,
      description: helpCollection.description,
      icon: helpCollection.icon,
      position: helpCollection.position,
      articleCount: sql<number>`count(${helpArticle.id})::int`,
    })
    .from(helpCollection)
    .innerJoin(
      helpArticle,
      and(eq(helpArticle.collectionId, helpCollection.id), published),
    )
    .where(eq(helpCollection.workspaceId, workspaceId))
    .groupBy(helpCollection.id)
    .orderBy(asc(helpCollection.position), asc(helpCollection.createdAt));
  return rows.map((r: HelpCollectionSummary) => ({
    ...r,
    articleCount: Number(r.articleCount || 0),
  }));
}

function toSummary({ articles: _, ...summary }: HelpTree["collections"][number]): HelpCollectionSummary {
  return summary;
}

/** Collections plus every published article link, grouped; feeds the home grid and the sidebar. */
async function loadHelpTree(db: Db, workspaceId: string): Promise<HelpTree> {
  const [collections, articles] = await Promise.all([
    listPublicCollections(db, workspaceId),
    db
      .select(linkColumns)
      .from(helpArticle)
      .where(and(eq(helpArticle.workspaceId, workspaceId), published))
      .orderBy(...articleOrder) as Promise<HelpArticleLink[]>,
  ]);
  const byCollection = new Map<string, HelpArticleLink[]>();
  const uncategorized: HelpArticleLink[] = [];
  for (const a of articles) {
    if (!a.collectionId) {
      uncategorized.push(a);
      continue;
    }
    const list = byCollection.get(a.collectionId) ?? [];
    list.push(a);
    byCollection.set(a.collectionId, list);
  }
  return {
    collections: collections.map((c) => ({ ...c, articles: byCollection.get(c.id) ?? [] })),
    uncategorized,
  };
}

export async function getHelpHomeData(
  db: Db,
  slug: string,
): Promise<HelpHomeData | null> {
  const ws = await findHelpPageWorkspace(db, slug);
  if (!ws) return null;

  const [tree, popular] = await Promise.all([
    loadHelpTree(db, ws.id),
    db
      .select({ ...linkColumns, collectionName: helpCollection.name })
      .from(helpArticle)
      .leftJoin(helpCollection, eq(helpArticle.collectionId, helpCollection.id))
      .where(and(eq(helpArticle.workspaceId, ws.id), published))
      .orderBy(
        desc(helpArticle.viewCount),
        desc(helpArticle.helpfulCount),
        ...articleOrder,
      )
      .limit(5),
  ]);

  return { workspace: ws, ...tree, popular };
}

export async function getHelpCollectionPageData(
  db: Db,
  slug: string,
  collectionSlug: string,
): Promise<HelpCollectionPageData | null> {
  const ws = await findHelpPageWorkspace(db, slug);
  if (!ws) return null;
  const tree = await loadHelpTree(db, ws.id);
  const match = tree.collections.find((c) => c.slug === collectionSlug);
  if (!match) return null;
  return { workspace: ws, collection: toSummary(match), articles: match.articles, tree };
}

export async function getHelpArticlePageData(
  db: Db,
  slug: string,
  articleSlug: string,
): Promise<HelpArticlePageData | null> {
  const ws = await findHelpPageWorkspace(db, slug);
  if (!ws) return null;

  const [row] = await db
    .select({
      ...linkColumns,
      content: helpArticle.content,
      updatedAt: helpArticle.updatedAt,
      publishedAt: helpArticle.publishedAt,
      authorId: helpArticle.authorId,
      authorName: user.name,
      authorImage: user.image,
      authorRole: workspaceMember.role,
      ownerId: workspace.ownerId,
    })
    .from(helpArticle)
    .leftJoin(user, eq(helpArticle.authorId, user.id))
    .leftJoin(workspace, eq(helpArticle.workspaceId, workspace.id))
    .leftJoin(
      workspaceMember,
      and(
        eq(workspaceMember.workspaceId, helpArticle.workspaceId),
        eq(workspaceMember.userId, helpArticle.authorId),
      ),
    )
    .where(
      and(
        eq(helpArticle.workspaceId, ws.id),
        eq(helpArticle.slug, articleSlug),
        published,
      ),
    )
    .limit(1);
  if (!row) return null;

  const { authorId, authorName, authorImage, authorRole, ownerId, ...rest } = row;
  const article: PublicHelpArticle = {
    ...rest,
    author: {
      name: authorName ?? null,
      image: authorImage ?? null,
      role: authorRole ?? null,
      isOwner: Boolean(authorId) && authorId === ownerId,
      isFeatul: authorId === "featul-founder",
    },
  };

  const tree = await loadHelpTree(db, ws.id);
  const match = tree.collections.find((c) => c.id === article.collectionId);
  const collection = match ? toSummary(match) : null;
  const siblings = match ? match.articles : tree.uncategorized;

  const index = siblings.findIndex((s) => s.id === article.id);
  return {
    workspace: ws,
    article,
    collection,
    siblings,
    tree,
    previous: index > 0 ? (siblings[index - 1] ?? null) : null,
    next: index >= 0 ? (siblings[index + 1] ?? null) : null,
  };
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/** Published articles whose title, summary or body mention the query; title hits rank first. */
export async function searchHelpArticles(
  db: Db,
  workspaceId: string,
  query: string,
  limit = 8,
) {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${escapeLike(q)}%`;
  return db
    .select({ ...linkColumns, collectionName: helpCollection.name })
    .from(helpArticle)
    .leftJoin(helpCollection, eq(helpArticle.collectionId, helpCollection.id))
    .where(
      and(
        eq(helpArticle.workspaceId, workspaceId),
        published,
        or(
          ilike(helpArticle.title, pattern),
          ilike(helpArticle.summary, pattern),
          // Plain text, so JSON keys like "paragraph" or "type" don't match every article.
          ilike(helpArticle.searchText, pattern),
        ),
      ),
    )
    .orderBy(
      sql`case when ${helpArticle.title} ilike ${pattern} then 0 else 1 end`,
      desc(helpArticle.viewCount),
    )
    .limit(limit);
}

/** Slug unique within the workspace, suffixed -2, -3... on collision. */
export async function uniqueHelpSlug(
  db: Db,
  table: typeof helpArticle | typeof helpCollection,
  workspaceId: string,
  base: string,
  excludeId?: string,
) {
  const root = base || "untitled";
  const rows: Array<{ id: string; slug: string }> = await db
    .select({ id: table.id, slug: table.slug })
    .from(table)
    .where(
      and(
        eq(table.workspaceId, workspaceId),
        or(eq(table.slug, root), ilike(table.slug, `${escapeLike(root)}-%`)),
      ),
    );
  const taken = new Set(
    rows.filter((r) => r.id !== excludeId).map((r) => r.slug),
  );
  if (!taken.has(root)) return root;
  for (let n = 2; ; n++) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Every collection and article for the dashboard, drafts included. */
export async function getHelpAdminTree(db: Db, workspaceId: string) {
  const [collections, articles] = await Promise.all([
    db
      .select({
        id: helpCollection.id,
        name: helpCollection.name,
        slug: helpCollection.slug,
        description: helpCollection.description,
        icon: helpCollection.icon,
        position: helpCollection.position,
      })
      .from(helpCollection)
      .where(eq(helpCollection.workspaceId, workspaceId))
      .orderBy(asc(helpCollection.position), asc(helpCollection.createdAt)),
    db
      .select({
        ...linkColumns,
        status: helpArticle.status,
        position: helpArticle.position,
        viewCount: helpArticle.viewCount,
        helpfulCount: helpArticle.helpfulCount,
        notHelpfulCount: helpArticle.notHelpfulCount,
        updatedAt: helpArticle.updatedAt,
        authorId: helpArticle.authorId,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(helpArticle)
      .leftJoin(user, eq(helpArticle.authorId, user.id))
      .where(eq(helpArticle.workspaceId, workspaceId))
      .orderBy(...articleOrder),
  ]);
  return { collections, articles };
}

export async function nextHelpPosition(
  db: Db,
  table: typeof helpArticle | typeof helpCollection,
  where: ReturnType<typeof and> | ReturnType<typeof eq>,
) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${table.position}), -1)::int` })
    .from(table)
    .where(where);
  return Number(row?.max ?? -1) + 1;
}

