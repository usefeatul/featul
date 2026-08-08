import { createChangelogAiStreamResponse } from "@featul/api/services/changelog-ai-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return createChangelogAiStreamResponse(req);
}
