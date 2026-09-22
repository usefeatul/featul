import { renderLlmsFullTxt } from "@/lib/llms/content"
import { markdownResponse } from "@/lib/llms/response"

export const revalidate = 86400

export async function GET() {
  return markdownResponse(await renderLlmsFullTxt())
}
