import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { db, post, board, workspace, user } from '../index'
import { eq, inArray } from 'drizzle-orm'

loadEnv({ path: path.resolve(process.cwd(), '../../apps/app/.env') })
loadEnv()

const WORKSPACE_ID = process.env.WORKSPACE_ID!
const FEATURE_BOARD_ID = process.env.FEATURE_BOARD_ID!
const BUGS_BOARD_ID = process.env.BUGS_BOARD_ID!
const USER_ID = process.env.USER_ID!

if (!WORKSPACE_ID || !FEATURE_BOARD_ID || !BUGS_BOARD_ID || !USER_ID) {
  throw new Error('Missing required environment variables: WORKSPACE_ID, FEATURE_BOARD_ID, BUGS_BOARD_ID, USER_ID')
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const adjectives = ['Smart', 'Fast', 'Reliable', 'Simple', 'Secure', 'Modern', 'Flexible', 'Robust', 'Scalable', 'Intuitive']
const nouns = ['Dashboard', 'API', 'Upload', 'Login', 'Notifications', 'Analytics', 'Widget', 'Editor', 'Settings', 'Search']
const verbs = ['Improvement', 'Fix', 'Update', 'Enhancement', 'Optimization', 'Refactor', 'Redesign', 'Integration', 'Support', 'Validation']
const contexts = ['for Better User Experience', 'on Mobile Devices', 'in Dark Mode', 'during Onboarding', 'with Large Datasets', 'for Team Accounts', 'in Settings Panel', 'when Offline', 'via Public API', 'after System Update']

function randomTitle() {
  return `${randItem(adjectives)} ${randItem(nouns)} ${randItem(verbs)} ${randItem(contexts)}`
}

function randomContent(kind: 'feature' | 'bug') {
  const p1 = `This ${kind} request describes ${randItem(['a performance issue', 'a usability improvement', 'a new capability', 'an intermittent error', 'a missing workflow', 'an edge case'])}.`
  const p2 = `Users report ${randItem(['unexpected behavior', 'slow response', 'confusing UI', 'limited configuration', 'lack of visibility', 'unstable interactions'])} in certain scenarios.`
  const p3 = `Proposed solution: ${randItem(['add an option', 'optimize queries', 'update UI copy', 'show progress indicators', 'improve error handling', 'add keyboard shortcuts'])}.`
  return [p1, p2, p3].join('\n\n')
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

/** Mix of fresh (<30d) and stale (30–180d) activity dates for UI testing. */
function randomActivityDate() {
  const stale = Math.random() < 0.55
  return daysAgo(stale ? randInt(30, 180) : randInt(0, 29))
}

async function main() {
  const [ws] = await db.select({ id: workspace.id }).from(workspace).where(eq(workspace.id, WORKSPACE_ID)).limit(1)
  if (!ws) throw new Error('Workspace not found')

  const boards = await db
    .select({ id: board.id, workspaceId: board.workspaceId, roadmapStatuses: board.roadmapStatuses, slug: board.slug })
    .from(board)
    .where(inArray(board.id, [FEATURE_BOARD_ID, BUGS_BOARD_ID]))
  if (boards.length !== 2) throw new Error('One or more boards not found')
  for (const b of boards) {
    if (String(b.workspaceId) !== WORKSPACE_ID) throw new Error('Board does not belong to workspace')
  }
  const featureBoard = boards.find((b) => String(b.id) === FEATURE_BOARD_ID)!
  const bugBoard = boards.find((b) => String(b.id) === BUGS_BOARD_ID)!

  const [u] = await db.select({ id: user.id }).from(user).where(eq(user.id, USER_ID)).limit(1)
  const authorId = u ? USER_ID : undefined

  const makeRows = (b: typeof featureBoard, count: number, kind: 'feature' | 'bug') => {
    const statuses = Array.isArray(b.roadmapStatuses)
      ? b.roadmapStatuses.map((s: any) => String(s.id))
      : ['pending', 'review', 'planned', 'progress', 'completed', 'closed']
    const openStatuses = statuses.filter((s) => s !== 'completed' && s !== 'closed')
    const rows: any[] = []
    for (let i = 0; i < count; i++) {
      const title = randomTitle()
      const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 8)}`
      const isAnon = Math.random() < 0.3
      const activityAt = randomActivityDate()
      // Prefer open statuses so stale badges show on the default requests list
      const roadmapStatus =
        Math.random() < 0.85 && openStatuses.length > 0
          ? randItem(openStatuses)
          : randItem(statuses)
      rows.push({
        boardId: b.id,
        title,
        content: randomContent(kind),
        slug,
        authorId: isAnon ? undefined : authorId,
        isAnonymous: isAnon,
        status: 'published',
        roadmapStatus,
        publishedAt: activityAt,
        createdAt: activityAt,
        updatedAt: activityAt,
        commentCount: randInt(0, 12),
        upvotes: randInt(0, 200),
      })
    }
    return rows
  }

  const featureRows = makeRows(featureBoard, 50, 'feature')
  const bugRows = makeRows(bugBoard, 50, 'bug')

  await db.insert(post).values(featureRows)
  await db.insert(post).values(bugRows)
}

main()
  .then(() => {
    console.log('Inserted 100 posts (50 per board), ~55% stale (30–180 days)')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
