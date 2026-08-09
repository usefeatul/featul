import { createChangelogAiStreamResponse } from "@featul/api/services/changelog-ai-stream";
import { getServerSession } from "@featul/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Authenticated workspace managers only — see authorizePrivateChangelogAiRequest. */
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return Response.json(
      { message: "Unauthorized" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return createChangelogAiStreamResponse(req);
}
