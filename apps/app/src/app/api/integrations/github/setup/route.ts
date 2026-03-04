import { verifySetupState } from "@featul/api/services/github-setup-state"

function redirectWithError(origin: string, message: string): Response {
  const url = new URL("/workspaces", origin)
  url.searchParams.set("github_error", message)
  return Response.redirect(url, 302)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const installationId = String(url.searchParams.get("installation_id") || "").trim()
  const state = String(url.searchParams.get("state") || "").trim()

  if (!installationId || !state) {
    return redirectWithError(url.origin, "missing_installation_or_state")
  }

  try {
    const parsed = verifySetupState(state)
    const destination = new URL(`/workspaces/${encodeURIComponent(parsed.workspaceSlug)}/settings/integrations`, url.origin)
    destination.searchParams.set("github_installation_id", installationId)
    destination.searchParams.set("github_state", state)
    return Response.redirect(destination, 302)
  } catch {
    return redirectWithError(url.origin, "invalid_state")
  }
}
