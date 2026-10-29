import { json, readQuery, withApiKey } from "@featul/api/public-api/http";
import { listFeedback, listFeedbackSchema } from "@featul/api/public-api/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public REST API: list feedback posts, e.g. `?status=pending&untagged=true&sort=votes`. */
export const GET = withApiKey("feedback:read", async ({ req, key, db }) => {
  const query = readQuery(req, listFeedbackSchema);
  return json(await listFeedback(db, key, query));
});
