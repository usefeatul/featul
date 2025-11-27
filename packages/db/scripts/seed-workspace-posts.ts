import 'dotenv/config'
import { db, post, board, workspace, user } from '../index'
import { eq, inArray } from 'drizzle-orm'

const WORKSPACE_ID = 'b43b792e-e113-4d83-938d-4ab5dc391ec7'
const FEATURE_BOARD_ID = 'c8506da7-2f0d-4c9d-a9b3-7613a17f497c'
const BUGS_BOARD_ID = 'c678e4a3-fd51-4304-bdd2-fafc7d8c0e53'
const USER_ID = 'EyUcJjKxIS2KL2rjhYmNN8AYtjnhor78'

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

const firstNames = ['Avery','Jordan','Taylor','Morgan','Casey','Riley','Cameron','Skyler','Quinn','Alex','Jamie','Drew','Charlie','Parker','Hayden','Rowan','Blake','Emerson','Reese','Sage']
const lastNames = ['Lee','Garcia','Patel','Kim','Nguyen','Diaz','Brown','Smith','Jones','Martins','Lopez','Hernandez','Singh','Wilson','Clark','Young','Hall','Allen','Scott','Adams']
function randomName() {
  return `${randItem(firstNames)} ${randItem(lastNames)}`
}

function randomTitle(kind: 'feature' | 'bug') {
  const base = `${randItem(adjectives)} ${randItem(nouns)} ${randItem(verbs)}`
  return kind === 'bug' ? `Bug: ${base}` : `Feature: ${base}`
}

function randomContent(kind: 'feature' | 'bug') {
  const p1 = `This ${kind} request describes ${randItem(['a performance issue','a usability improvement','a new capability','an intermittent error','a missing workflow','an edge case'])}.`
  const p2 = `Users report ${randItem(['unexpected behavior','slow response','confusing UI','limited configuration','lack of visibility','unstable interactions'])} in certain scenarios.`
  const p3 = `Proposed solution: ${randItem(['add an option','optimize queries','update UI copy','show progress indicators','improve error handling','add keyboard shortcuts'])}.`
  return [p1, p2, p3].join('\n\n')
}

function randomRecentDate(days: number) {
  const now = Date.now()
  const past = now - randInt(0, days) * 24 * 60 * 60 * 1000
  return new Date(past)
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
    const statuses = Array.isArray(b.roadmapStatuses) ? b.roadmapStatuses.map((s: any) => String(s.id)) : ['pending','review','planned','progress','completed','closed']
    const rows: any[] = []
    for (let i = 0; i < count; i++) {
      const title = randomTitle(kind)
      const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 8)}`
      const isAnon = Math.random() < 0.3
      const name = randomName()
      const seed = isAnon ? slug : name
      rows.push({
        boardId: b.id,
        title,
        content: randomContent(kind),
        slug,
        authorId: isAnon ? undefined : authorId,
        authorName: isAnon ? null : name,
        authorImage: randomAvatarUrl(seed, 'avataaars'),
        isAnonymous: isAnon,
        status: 'published',
        roadmapStatus: randItem(statuses),
        publishedAt: randomRecentDate(180),
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
  .then(() => { console.log('Inserted 100 posts (50 per board)') })
  .catch((err) => { console.error(err); process.exit(1) })
function randomAvatarUrl(seed?: string | null, style: 'identicon' | 'avataaars' = 'avataaars') {
  const s = encodeURIComponent((seed || 'anonymous').trim() || 'anonymous')
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${s}`
}
