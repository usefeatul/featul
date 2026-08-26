import { renderLlmsTxt } from "@/lib/llms/content"
import { markdownResponse } from "@/lib/llms/response"

export const revalidate = 86400

export function GET() {
  return markdownResponse(renderLlmsTxt())
}
