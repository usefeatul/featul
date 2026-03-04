import { createSign } from "node:crypto"
import { HTTPException } from "hono/http-exception"

type GithubRepository = {
  id: string
  name: string
  fullName: string
  owner: string
  private: boolean
}

type GithubIssue = {
  id: string
  number: string
  title: string
  body: string
  htmlUrl: string
  state: string
  stateReason: string | null
  updatedAt: string | null
  labels: string[]
  isPullRequest: boolean
}

function toBase64Url(input: Buffer | string): string {
  const raw = Buffer.isBuffer(input) ? input.toString("base64") : Buffer.from(input, "utf8").toString("base64")
  return raw.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function readRequiredEnv(name: string): string {
  const value = String(process.env[name] || "").trim()
  if (!value) {
    throw new HTTPException(500, { message: `Missing required env: ${name}` })
  }
  return value
}

function getAppPrivateKey(): string {
  const raw = readRequiredEnv("GITHUB_APP_PRIVATE_KEY")
  // Support both real multiline private key and escaped newlines.
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw
}

export function isGithubAppConfigured(): boolean {
  return (
    String(process.env.GITHUB_APP_ID || "").trim().length > 0
    && String(process.env.GITHUB_APP_PRIVATE_KEY || "").trim().length > 0
  )
}

function createGithubAppJwt(now = Math.floor(Date.now() / 1000)): string {
  const appId = readRequiredEnv("GITHUB_APP_ID")
  const privateKey = getAppPrivateKey()

  const header = {
    alg: "RS256",
    typ: "JWT",
  }
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: appId,
  }

  const encodedHeader = toBase64Url(JSON.stringify(header))
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const body = `${encodedHeader}.${encodedPayload}`

  const signer = createSign("RSA-SHA256")
  signer.update(body)
  signer.end()
  const signature = signer.sign(privateKey)
  return `${body}.${toBase64Url(signature)}`
}

async function githubApiRequest(path: string, init?: RequestInit): Promise<Response> {
  const jwt = createGithubAppJwt()
  const headers = new Headers(init?.headers)
  headers.set("Authorization", `Bearer ${jwt}`)
  headers.set("Accept", "application/vnd.github+json")
  headers.set("X-GitHub-Api-Version", "2022-11-28")

  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers,
  })
}

async function githubInstallationRequest(installationToken: string, path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set("Authorization", `Bearer ${installationToken}`)
  headers.set("Accept", "application/vnd.github+json")
  headers.set("X-GitHub-Api-Version", "2022-11-28")

  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers,
  })
}

export function getGithubAppInstallUrl(state: string): string {
  const explicit = String(process.env.GITHUB_APP_INSTALL_URL || "").trim()
  if (explicit) {
    const url = new URL(explicit)
    url.searchParams.set("state", state)
    return url.toString()
  }

  const slug = String(process.env.GITHUB_APP_SLUG || "").trim()
  if (!slug) {
    throw new HTTPException(500, {
      message: "Missing GitHub app install URL config. Set GITHUB_APP_INSTALL_URL or GITHUB_APP_SLUG",
    })
  }

  const url = new URL(`https://github.com/apps/${slug}/installations/new`)
  url.searchParams.set("state", state)
  return url.toString()
}

export async function createInstallationToken(installationId: string): Promise<string> {
  const response = await githubApiRequest(`/app/installations/${encodeURIComponent(installationId)}/access_tokens`, {
    method: "POST",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new HTTPException(502, { message: `GitHub installation token request failed: ${body || response.statusText}` })
  }

  const data = (await response.json()) as { token?: string }
  const token = String(data?.token || "").trim()
  if (!token) {
    throw new HTTPException(502, { message: "GitHub installation token response was missing token" })
  }
  return token
}

export async function listInstallationRepositories(installationId: string): Promise<GithubRepository[]> {
  const token = await createInstallationToken(installationId)
  const response = await githubInstallationRequest(token, "/installation/repositories?per_page=100")
  if (!response.ok) {
    const body = await response.text()
    throw new HTTPException(502, { message: `GitHub repositories request failed: ${body || response.statusText}` })
  }

  const data = (await response.json()) as {
    repositories?: Array<{
      id: number | string
      name?: string
      full_name?: string
      private?: boolean
      owner?: { login?: string }
    }>
  }

  const repositories = Array.isArray(data?.repositories) ? data.repositories : []
  return repositories
    .map((repo) => ({
      id: String(repo.id),
      name: String(repo.name || ""),
      fullName: String(repo.full_name || ""),
      owner: String(repo.owner?.login || ""),
      private: Boolean(repo.private),
    }))
    .filter((repo) => repo.id && repo.name && repo.fullName && repo.owner)
}

export async function assertInstallationHasRepository(input: {
  installationId: string
  repositoryId: string
}): Promise<GithubRepository> {
  const repos = await listInstallationRepositories(input.installationId)
  const repo = repos.find((it) => String(it.id) === String(input.repositoryId))
  if (!repo) {
    throw new HTTPException(404, { message: "Repository is not available for this GitHub installation" })
  }
  return repo
}

export async function listRepositoryIssues(input: {
  installationId: string
  owner: string
  repo: string
  state?: "open" | "closed" | "all"
  since?: string
  page?: number
  perPage?: number
}): Promise<{ issues: GithubIssue[]; hasMore: boolean }> {
  const token = await createInstallationToken(input.installationId)

  const params = new URLSearchParams()
  params.set("state", input.state || "all")
  params.set("sort", "updated")
  params.set("direction", "desc")
  params.set("per_page", String(input.perPage || 30))
  params.set("page", String(input.page || 1))
  if (input.since) params.set("since", input.since)

  const path = `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/issues?${params.toString()}`
  const response = await githubInstallationRequest(token, path)
  if (!response.ok) {
    const body = await response.text()
    throw new HTTPException(502, { message: `GitHub issues request failed: ${body || response.statusText}` })
  }

  const raw = (await response.json()) as Array<{
    id?: number | string
    number?: number | string
    title?: string
    body?: string | null
    html_url?: string
    state?: string
    state_reason?: string | null
    updated_at?: string
    pull_request?: unknown
    labels?: Array<{ name?: string }>
  }>

  const issues = (Array.isArray(raw) ? raw : []).map((issue) => ({
    id: String(issue.id || ""),
    number: String(issue.number || ""),
    title: String(issue.title || "").trim(),
    body: String(issue.body || ""),
    htmlUrl: String(issue.html_url || ""),
    state: String(issue.state || "open").toLowerCase(),
    stateReason: issue.state_reason ? String(issue.state_reason) : null,
    updatedAt: issue.updated_at ? String(issue.updated_at) : null,
    labels: Array.isArray(issue.labels)
      ? issue.labels.map((label) => String(label?.name || "").trim().toLowerCase()).filter(Boolean)
      : [],
    isPullRequest: Boolean(issue.pull_request),
  }))

  const linkHeader = response.headers.get("link") || ""
  const hasMore = /rel="next"/.test(linkHeader)

  return {
    issues,
    hasMore,
  }
}

export type { GithubIssue, GithubRepository }
