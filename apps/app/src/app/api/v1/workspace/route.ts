import { json, withApiKey } from "@featul/api/public-api/http";
import { getFeedbackOverview } from "@featul/api/public-api/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public REST API: the workspace's feedback boards, roadmap statuses with counts, and tags. */
export const GET = withApiKey("feedback:read", async ({ key, db }) => {
  return json(await getFeedbackOverview(db, key));
});
