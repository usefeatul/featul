import { HTTPException } from "hono/http-exception"

const API = "https://api.vercel.com"
const token = process.env.VERCEL_TOKEN || ""
const project = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME || ""

async function request(path: string, init: { method?: string; body?: string; headers?: Record<string, string> }): Promise<Response> {
  if (!token || !project) throw new HTTPException(500, { message: "Missing Vercel env: VERCEL_TOKEN and VERCEL_PROJECT_ID or VERCEL_PROJECT_NAME" })
  const url = `${API}${path}`
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  return fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } })
}

export async function addDomainToProject(domain: string): Promise<void> {
  const body = JSON.stringify({ name: domain })
  const res = await request(`/v10/projects/${project}/domains`, { method: "POST", body })
  if (res.ok) return
  if (res.status === 409) return
  let msg = "Failed to add domain to Vercel"
  try {
    const data = await res.json()
    msg = (data as { error?: { message?: string } })?.error?.message || msg
  } catch {}
  throw new HTTPException(res.status as any, { message: msg })
}

export async function removeDomainFromProject(domain: string): Promise<void> {
  const res = await request(`/v10/projects/${project}/domains/${encodeURIComponent(domain)}`, { method: "DELETE" })
  if (res.ok) return
  let msg = "Failed to remove domain from Vercel"
  try {
    const data = await res.json()
    msg = (data as { error?: { message?: string } })?.error?.message || msg
  } catch {}
  throw new HTTPException(res.status as any, { message: msg })
}

