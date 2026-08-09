import { eq } from "drizzle-orm"
import { board, post, postTag, tag, user } from "@featul/db"

const FOUNDER_ID = "featul-founder"
const FOUNDER_EMAIL = "jean@featul.com"

// SVG data URI for FeatulLogoIcon (extracted from packages/ui/src/icons/featul-logo.tsx)
const FEATUL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28" transform="rotate(-90)"><path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M11.986.764c-5.911 0-10.75 4.597-10.75 10.34 0 2.402.866 4.62 2.315 6.37 1.918 2.383 4.932 3.91 8.301 3.95l.036.013a68 68 0 0 0 1.915.657c1.177.386 2.674.842 3.886 1.095a2.32 2.32 0 0 0 1.72-.328c.478-.31.893-.848.893-1.544 0-.412-.167-.818-.329-1.131a7 7 0 0 0-.602-.941 11 11 0 0 0-.299-.384c2.247-1.88 3.664-4.655 3.664-7.758 0-3.552-1.85-6.671-4.663-8.517-1.74-1.163-3.83-1.822-6.087-1.822m6.378 5.273a.75.75 0 1 0-1.295.758 8.5 8.5 0 0 1 1.167 4.308 8.46 8.46 0 0 1-1.167 4.299.75.75 0 0 0 1.294.758 9.96 9.96 0 0 0 1.373-5.057 10 10 0 0 0-1.372-5.066"/></svg>`
const FEATUL_LOGO_DATA_URI = "data:image/svg+xml," + encodeURIComponent(FEATUL_LOGO_SVG)

function mkSlug(title: string) {
  const base = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  const suffix = Math.random().toString(36).slice(2, 8)
  return base ? `${base}-${suffix}` : `post-${suffix}`
}

function onboardingMeta(kind: "welcome" | "ideas" | "bugs") {
  return {
    customFields: {
      onboarding: true,
      onboardingKind: kind,
    },
  }
}

const ONBOARDING_POSTS = {
  welcome: {
    title: "Welcome to featul — your feedback hub is ready",
    kind: "welcome" as const,
    boardSlug: "features",
    tagSlugs: ["guide", "support"],
    isPinned: true,
    isFeatured: true,
    upvotes: 3,
    roadmapStatus: "review",
    content: [
      "This sample post shows how feedback looks in featul. You can edit or delete it anytime.",
      "What featul helps you do",
      "- Collect feature requests and bug reports in one place",
      "- Prioritize with votes, tags, and clear statuses",
      "- Share a public roadmap so customers know what is coming",
      "- Publish changelog updates when you ship",
      "Suggested next steps",
      "- Browse the sample posts below to see the flow",
      "- Create your first real post with Create Posts in the sidebar",
      "- Open Settings to add your logo, colors, and custom domain",
    ].join("\n\n"),
  },
  ideas: {
    title: "How to submit and track feature ideas",
    kind: "ideas" as const,
    boardSlug: "features",
    tagSlugs: ["guide", "ui"],
    isPinned: false,
    isFeatured: false,
    upvotes: 1,
    roadmapStatus: "planned",
    content: [
      "Use the Features board for product ideas, improvements, and user requests.",
      "Write a clear post",
      "- Add a short title that describes the outcome you want",
      "- Explain the problem or goal in a few sentences",
      "- Add tags like UI or Design to keep things organized",
      "Let the community prioritize",
      "- Others can upvote and comment on posts",
      "- Move items through Pending, Review, Planned, Progress, and Completed",
      "- Planned items can appear on your public roadmap",
    ].join("\n\n"),
  },
  bugs: {
    title: "Report bugs and close the loop with changelog",
    kind: "bugs" as const,
    boardSlug: "bugs",
    tagSlugs: ["guide", "bugs"],
    isPinned: false,
    isFeatured: false,
    upvotes: 0,
    roadmapStatus: "pending",
    content: [
      "Use the Bugs board when something is broken or behaves unexpectedly.",
      "What to include in a bug report",
      "- What you were trying to do",
      "- Steps to reproduce the issue",
      "- What you expected vs. what actually happened",
      "- Browser, device, or app version if relevant",
      "Keep users in the loop",
      "- Upvotes help the team spot widespread issues",
      "- Status updates show progress from triage to fix",
      "- Changelog entries announce when a fix ships",
    ].join("\n\n"),
  },
} as const

async function ensureFounderUser(db: any) {
  const [founder] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, FOUNDER_ID))
    .limit(1)

  if (!founder) {
    await db.insert(user).values({
      id: FOUNDER_ID,
      name: "featul",
      email: FOUNDER_EMAIL,
      emailVerified: true,
      image: FEATUL_LOGO_DATA_URI,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return
  }

  await db
    .update(user)
    .set({ name: "featul", image: FEATUL_LOGO_DATA_URI, updatedAt: new Date() })
    .where(eq(user.id, FOUNDER_ID))
}

export async function seedWorkspaceOnboarding(db: any, workspaceId: string, _creatorUserId: string) {
  await ensureFounderUser(db)

  const boards = await db
    .select({ id: board.id, slug: board.slug })
    .from(board)
    .where(eq(board.workspaceId, workspaceId))

  const boardBySlug = new Map(boards.map((row: { id: string; slug: string }) => [row.slug, row.id]))

  const workspaceTags = await db
    .select({ id: tag.id, slug: tag.slug })
    .from(tag)
    .where(eq(tag.workspaceId, workspaceId))

  const tagBySlug = new Map(workspaceTags.map((row: { id: string; slug: string }) => [row.slug, row.id]))

  const now = new Date()
  const insertedPosts: Array<{ id: string; tagSlugs: string[] }> = []

  for (const template of Object.values(ONBOARDING_POSTS)) {
    const boardId = boardBySlug.get(template.boardSlug)
    if (!boardId) continue

    const [created] = await db
      .insert(post)
      .values({
        boardId,
        title: template.title,
        content: template.content,
        slug: mkSlug(template.title),
        authorId: FOUNDER_ID,
        isAnonymous: false,
        status: "published",
        roadmapStatus: template.roadmapStatus,
        isPinned: template.isPinned,
        isFeatured: template.isFeatured,
        upvotes: template.upvotes,
        metadata: onboardingMeta(template.kind),
        publishedAt: now,
      })
      .returning({ id: post.id })

    if (created?.id) {
      insertedPosts.push({ id: created.id, tagSlugs: [...template.tagSlugs] })
    }
  }

  const tagLinks = insertedPosts.flatMap(({ id, tagSlugs }) =>
    tagSlugs.flatMap((tagSlug) => {
      const tagId = tagBySlug.get(tagSlug)
      return tagId ? [{ postId: id, tagId }] : []
    }),
  )

  if (tagLinks.length > 0) {
    await db.insert(postTag).values(tagLinks)
  }
}
