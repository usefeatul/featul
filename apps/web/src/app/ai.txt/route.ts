import { textResponse } from "@/lib/md/http"
import { renderAiTxt } from "@/lib/md/site-files"

// Prerendered and revalidated daily; Next answers HEAD from the cached GET.
export const dynamic = "force-static"
export const revalidate = 86400

export async function GET() {
  return textResponse(await renderAiTxt())
}
