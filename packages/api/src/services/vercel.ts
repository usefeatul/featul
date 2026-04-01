import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"

const API = "https://api.vercel.com"
const token = process.env.VERCEL_TOKEN || ""
const project = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME || ""

type VercelErrorResponse = {
  error?: {
    message?: string
  }
}

async function request(path: string, init: { method?: string; body?: string; headers?: Record<string, string> }): Promise<Response> {
  if (!token || !project) throw new HTTPException(500, { message: "Missing Vercel env: VERCEL_TOKEN and VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME" })
  const url = `${API}${path}`
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  return fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } })
}

function toContentfulStatusCode(status: number): ContentfulStatusCode {
  if (status < 100 || status > 599 || status === 204 || status === 205 || status === 304) {
    return 500
  }
  return status as ContentfulStatusCode
}

async function readVercelErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json() as VercelErrorResponse
    return data.error?.message || fallback
  } catch (error) {
    console.warn("Failed to parse Vercel error response", error)
    return fallback
  }
}

export async function addDomainToProject(domain: string): Promise<void> {
  const body = JSON.stringify({ name: domain })
  const res = await request(`/v10/projects/${project}/domains`, { method: "POST", body })
  if (res.ok) return
  if (res.status === 409) return
  const msg = await readVercelErrorMessage(res, "Failed to add domain to Vercel")
  throw new HTTPException(toContentfulStatusCode(res.status), { message: msg })
}

export async function removeDomainFromProject(domain: string): Promise<void> {
  const res = await request(`/v10/projects/${project}/domains/${encodeURIComponent(domain)}`, { method: "DELETE" })
  if (res.ok) return
  const msg = await readVercelErrorMessage(res, "Failed to remove domain from Vercel")
  throw new HTTPException(toContentfulStatusCode(res.status), { message: msg })
}
