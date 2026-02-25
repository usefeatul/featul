interface ApiValidationIssue {
  message?: string
  path?: Array<string | number>
}

interface ApiErrorPayload {
  message?: string
  issues?: ApiValidationIssue[]
  error?: {
    message?: string
    issues?: ApiValidationIssue[]
  }
}

function getIssues(payload: ApiErrorPayload | null): ApiValidationIssue[] {
  if (!payload) return []
  if (Array.isArray(payload.issues)) return payload.issues
  if (Array.isArray(payload.error?.issues)) return payload.error.issues
  return []
}

function findIssueMessage(issues: ApiValidationIssue[], field?: string): string | null {
  if (field) {
    const fieldIssue = issues.find((issue) =>
      Array.isArray(issue.path) && issue.path.some((part) => String(part) === field) && typeof issue.message === "string"
    )
    if (fieldIssue?.message?.trim()) {
      return fieldIssue.message.trim()
    }
  }
  const firstIssue = issues.find((issue) => typeof issue.message === "string" && issue.message.trim().length > 0)
  return firstIssue?.message?.trim() || null
}

export async function readApiErrorMessage(response: Response, fallback: string, field?: string): Promise<string> {
  let payload: ApiErrorPayload | null = null
  try {
    payload = (await response.clone().json()) as ApiErrorPayload
  } catch {
    payload = null
  }

  const issues = getIssues(payload)
  const issueMessage = findIssueMessage(issues, field)
  if (issueMessage) return issueMessage

  const message = typeof payload?.message === "string" ? payload.message.trim() : ""
  if (message) return message

  const nestedMessage = typeof payload?.error?.message === "string" ? payload.error.message.trim() : ""
  if (nestedMessage) return nestedMessage

  try {
    const text = (await response.text()).trim()
    if (text) return text
  } catch {
    // ignore text parse errors
  }

  return fallback
}
