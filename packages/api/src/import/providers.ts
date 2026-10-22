import { createHash } from "node:crypto"
import { buildSmartColumnMap, getMappedCell, parseCsvContent, parseUrlList } from "../csv/import"

export type ImportProvider = "canny" | "nolt" | "productboard"

export type ProviderPost = {
  sourceId: string
  title: string
  content: string
  boardName: string | null
  status: string | null
  upvotes: number
  authorEmail: string | null
  imageUrls: string[]
  createdAt: Date | null
  updatedAt: Date | null
}

export type ProviderComment = {
  sourceId: string
  postSourceId: string
  parentSourceId: string | null
  content: string
  authorName: string | null
  authorEmail: string | null
  isInternal: boolean
  imageUrls: string[]
  createdAt: Date | null
}

export type ProviderImportData = {
  posts: ProviderPost[]
  comments: ProviderComment[]
  warnings: string[]
}

/** Provider failures the user can act on, such as a rejected key. */
export class ProviderImportError extends Error {
  constructor(message: string, readonly status: 400 | 502 = 400) {
    super(message)
  }
}

export const PROVIDER_POST_LIMIT = 5000
export const PROVIDER_COMMENT_LIMIT = 20_000
const PAGE_SIZE = 100
const REQUEST_TIMEOUT_MS = 20_000

type Fetch = typeof fetch

const PROVIDER_LABELS: Record<ImportProvider, string> = {
  canny: "Canny",
  nolt: "Nolt",
  productboard: "ProductBoard",
}

async function request(fetcher: Fetch, provider: ImportProvider, url: string, init: RequestInit): Promise<Response> {
  const label = PROVIDER_LABELS[provider]
  let res: Response
  try {
    // Never follow redirects: the destination must stay on the provider's host.
    res = await fetcher(url, { ...init, redirect: "error", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  } catch {
    throw new ProviderImportError(`Could not reach ${label}. Try again in a moment.`, 502)
  }
  if (res.status === 401 || res.status === 403) {
    throw new ProviderImportError(`${label} rejected the API key. Check it and try again.`)
  }
  if (res.status === 404) {
    throw new ProviderImportError(`${label} could not find that account or board.`)
  }
  if (res.status === 429) {
    throw new ProviderImportError(`${label} is rate limiting requests. Try again in a minute.`, 502)
  }
  if (!res.ok) {
    throw new ProviderImportError(`${label} returned an error (${res.status}).`, 502)
  }
  return res
}

async function readJson(res: Response, provider: ImportProvider): Promise<Record<string, unknown>> {
  const body = await res.json().catch(() => null)
  if (!isRecord(body)) {
    throw new ProviderImportError(`${PROVIDER_LABELS[provider]} returned an unexpected response.`, 502)
  }
  return body
}

/* ------------------------------------------------------------------ Canny */

const CANNY_API = "https://canny.io/api"

export async function fetchCannyData(apiKey: string, fetcher: Fetch = fetch): Promise<ProviderImportData> {
  const warnings: string[] = []
  const post = (path: string, body: Record<string, unknown>) =>
    request(fetcher, "canny", `${CANNY_API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, ...body }),
    }).then((res) => readJson(res, "canny"))

  const posts: ProviderPost[] = []
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const page = await post("/v1/posts/list", { limit: PAGE_SIZE, skip, sort: "oldest" })
    if (typeof page.error === "string") throw new ProviderImportError(`Canny: ${page.error}`)
    const items = Array.isArray(page.posts) ? page.posts : []
    for (const item of items) {
      if (!isRecord(item)) continue
      const id = str(item.id)
      const title = str(item.title)
      if (!id || !title) continue
      posts.push({
        sourceId: `canny_${id}`,
        title,
        content: str(item.details) || "",
        boardName: isRecord(item.board) ? str(item.board.name) : null,
        status: str(item.status),
        upvotes: num(item.score),
        authorEmail: isRecord(item.author) ? str(item.author.email) : null,
        imageUrls: urls(item.imageURLs),
        createdAt: date(item.created),
        updatedAt: null,
      })
    }
    if (posts.length >= PROVIDER_POST_LIMIT) {
      warnings.push(`Only the first ${PROVIDER_POST_LIMIT} Canny posts were imported.`)
      posts.length = PROVIDER_POST_LIMIT
      break
    }
    if (page.hasMore !== true || items.length === 0) break
  }

  const known = new Set(posts.map((p) => p.sourceId))
  const comments: ProviderComment[] = []
  let cursor: string | null = null
  do {
    const page = await post("/v2/comments/list", { limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) })
    if (typeof page.error === "string") throw new ProviderImportError(`Canny: ${page.error}`)
    const items = Array.isArray(page.items) ? page.items : []
    for (const item of items) {
      if (!isRecord(item)) continue
      const id = str(item.id)
      const postId = isRecord(item.post) ? str(item.post.id) : null
      const value = str(item.value)
      if (!id || !postId || !value) continue
      const postSourceId = `canny_${postId}`
      if (!known.has(postSourceId)) continue
      const parentId = str(item.parentID)
      comments.push({
        sourceId: `canny_${id}`,
        postSourceId,
        parentSourceId: parentId ? `canny_${parentId}` : null,
        content: value,
        authorName: isRecord(item.author) ? str(item.author.name) : null,
        authorEmail: isRecord(item.author) ? str(item.author.email) : null,
        isInternal: item.internal === true,
        imageUrls: urls(item.imageURLs),
        createdAt: date(item.created),
      })
    }
    if (comments.length >= PROVIDER_COMMENT_LIMIT) {
      warnings.push(`Only the first ${PROVIDER_COMMENT_LIMIT} Canny comments were imported.`)
      comments.length = PROVIDER_COMMENT_LIMIT
      break
    }
    cursor = page.hasNextPage === true && items.length > 0 ? str(page.cursor) : null
  } while (cursor)

  return { posts, comments, warnings }
}

/* ----------------------------------------------------------- ProductBoard */

const PRODUCTBOARD_ORIGIN = "https://api.productboard.com"

type ProductboardEntity = {
  id: string
  type: string
  name: string
  description: string
  status: string | null
  archived: boolean
  parentId: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

async function listProductboardEntities(
  token: string,
  type: "feature" | "component" | "product",
  fetcher: Fetch
): Promise<ProductboardEntity[]> {
  const entities: ProductboardEntity[] = []
  let url: string | null = `${PRODUCTBOARD_ORIGIN}/v2/entities?type[]=${type}`
  while (url) {
    const res = await request(fetcher, "productboard", url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
    const body = await readJson(res, "productboard")
    const items = Array.isArray(body.data) ? body.data : []
    for (const item of items) {
      const entity = toProductboardEntity(item)
      if (entity) entities.push(entity)
    }
    if (entities.length >= PROVIDER_POST_LIMIT) break
    const next = isRecord(body.links) ? str(body.links.next) : null
    url = next && items.length > 0 ? resolveProductboardNext(next) : null
  }
  return entities
}

function resolveProductboardNext(next: string): string | null {
  const resolved = new URL(next, PRODUCTBOARD_ORIGIN)
  // Only follow pagination links that stay on the API host so the token never leaks.
  return resolved.origin === PRODUCTBOARD_ORIGIN ? resolved.toString() : null
}

function toProductboardEntity(item: unknown): ProductboardEntity | null {
  if (!isRecord(item)) return null
  const id = str(item.id)
  const fields = isRecord(item.fields) ? item.fields : {}
  if (!id) return null
  const relationships = isRecord(item.relationships) && Array.isArray(item.relationships.data)
    ? item.relationships.data
    : []
  const parent = relationships.find((r) => isRecord(r) && r.type === "parent")
  const parentId = isRecord(parent) && isRecord(parent.target) ? str(parent.target.id) : null
  return {
    id,
    type: str(item.type) || "",
    name: str(fields.name) || "",
    description: typeof fields.description === "string" ? htmlToText(fields.description) : "",
    status: isRecord(fields.status) ? str(fields.status.name) : null,
    archived: fields.archived === true,
    parentId,
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  }
}

export async function fetchProductboardData(token: string, fetcher: Fetch = fetch): Promise<ProviderImportData> {
  const warnings: string[] = []
  const [features, components, products] = await Promise.all([
    listProductboardEntities(token, "feature", fetcher),
    listProductboardEntities(token, "component", fetcher),
    listProductboardEntities(token, "product", fetcher),
  ])

  const byId = new Map<string, ProductboardEntity>()
  for (const entity of [...features, ...components, ...products]) byId.set(entity.id, entity)

  // Subfeatures hang off features, so walk up to the nearest component or product.
  const boardNameFor = (entity: ProductboardEntity): string | null => {
    let parentId = entity.parentId
    for (let depth = 0; parentId && depth < 10; depth += 1) {
      const parent = byId.get(parentId)
      if (!parent) return null
      if (parent.type !== "feature" && parent.type !== "subfeature") return parent.name || null
      parentId = parent.parentId
    }
    return null
  }

  let archived = 0
  const posts: ProviderPost[] = []
  for (const feature of features) {
    if (!feature.name) continue
    if (feature.archived) {
      archived += 1
      continue
    }
    posts.push({
      sourceId: `productboard_${feature.id}`,
      title: feature.name,
      content: feature.description,
      boardName: boardNameFor(feature),
      status: feature.status,
      upvotes: 0,
      authorEmail: null,
      imageUrls: [],
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    })
  }
  if (archived > 0) warnings.push(`Skipped ${archived} archived ProductBoard features.`)
  if (posts.length > PROVIDER_POST_LIMIT) {
    warnings.push(`Only the first ${PROVIDER_POST_LIMIT} ProductBoard features were imported.`)
    posts.length = PROVIDER_POST_LIMIT
  }
  return { posts, comments: [], warnings }
}

/* ------------------------------------------------------------------- Nolt */

const NOLT_HOST_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:eu\.)?nolt\.io$/

/** Accepts `acme`, `acme.nolt.io`, or a full board URL. Only nolt.io hosts are allowed. */
export function resolveNoltBoardOrigin(raw: string): string {
  const value = raw.trim().toLowerCase()
  const withHost = /^[a-z0-9-]+$/.test(value) ? `${value}.nolt.io` : value
  let url: URL
  try {
    url = new URL(/^https?:\/\//.test(withHost) ? withHost : `https://${withHost}`)
  } catch {
    throw new ProviderImportError("Enter your Nolt board URL, like acme.nolt.io.")
  }
  if (!NOLT_HOST_REGEX.test(url.hostname)) {
    throw new ProviderImportError("Enter your Nolt board URL, like acme.nolt.io.")
  }
  return `https://${url.hostname}`
}

export async function fetchNoltData(boardUrl: string, apiKey: string, fetcher: Fetch = fetch): Promise<ProviderImportData> {
  const origin = resolveNoltBoardOrigin(boardUrl)
  const res = await request(fetcher, "nolt", `${origin}/api/csv?apikey=${encodeURIComponent(apiKey)}`, {
    headers: { Accept: "text/csv" },
  })
  return parseNoltCsv(await res.text())
}

export function parseNoltCsv(csv: string): ProviderImportData {
  const warnings: string[] = []
  const parsed = parseCsvContent(csv)
  if (parsed.headers.length === 0) {
    throw new ProviderImportError("Nolt returned an empty export.", 502)
  }
  const { fieldIndex } = buildSmartColumnMap(parsed.headers)
  if (fieldIndex.title === undefined) {
    throw new ProviderImportError("Nolt's export has no title column. Contact support so we can update the importer.", 502)
  }

  const posts: ProviderPost[] = []
  for (const row of parsed.rows) {
    const title = getMappedCell(row, fieldIndex, "title").trim()
    if (!title) continue
    const id = getMappedCell(row, fieldIndex, "id").trim()
    posts.push({
      // Without an ID column, the title keeps re-imports from duplicating posts.
      sourceId: `nolt_${id || hash(title)}`,
      title,
      content: getMappedCell(row, fieldIndex, "content"),
      boardName: getMappedCell(row, fieldIndex, "board").trim() || null,
      status: getMappedCell(row, fieldIndex, "roadmapStatus").trim() || null,
      upvotes: num(getMappedCell(row, fieldIndex, "upvotes")),
      authorEmail: getMappedCell(row, fieldIndex, "authorEmail").trim() || null,
      imageUrls: [
        ...parseUrlList(getMappedCell(row, fieldIndex, "attachments")),
        ...parseUrlList(getMappedCell(row, fieldIndex, "image")),
      ],
      createdAt: date(getMappedCell(row, fieldIndex, "createdAt")),
      updatedAt: date(getMappedCell(row, fieldIndex, "updatedAt")),
    })
  }
  if (posts.length > PROVIDER_POST_LIMIT) {
    warnings.push(`Only the first ${PROVIDER_POST_LIMIT} Nolt posts were imported.`)
    posts.length = PROVIDER_POST_LIMIT
  }
  return { posts, comments: [], warnings }
}

/* ---------------------------------------------------------------- helpers */

/** Productboard descriptions are HTML. Posts are plain text. */
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<\/\s*(p|div|h[1-6]|li|ul|ol|blockquote)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function str(value: unknown): string | null {
  if (typeof value === "number") return String(value)
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed || null
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim())
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 2_147_483_647) : 0
}

function date(value: unknown): Date | null {
  const raw = str(value)
  if (!raw) return null
  const ms = Date.parse(raw)
  return Number.isNaN(ms) ? null : new Date(ms)
}

function urls(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === "string" && /^https?:\/\//i.test(v))
}

function hash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 16)
}
