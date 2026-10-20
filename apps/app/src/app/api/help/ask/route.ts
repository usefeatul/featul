import { createHelpAskResponse } from "@featul/api/help/ask";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public: visitors of a help center on a plan with Ask AI. Rate limited per IP. */
export async function POST(req: Request) {
  return createHelpAskResponse(req);
}
