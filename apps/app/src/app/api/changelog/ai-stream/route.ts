import { createChangelogAiStreamResponse } from "@featul/api/services/changelog-ai-stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return createChangelogAiStreamResponse(req);
}
