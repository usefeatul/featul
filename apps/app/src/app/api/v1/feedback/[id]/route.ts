import { json, readBody, withApiKey } from "@featul/api/public-api/http";
import { getFeedback, updateFeedback, updateFeedbackSchema } from "@featul/api/public-api/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public REST API: one feedback post with its description and comments. */
export const GET = withApiKey("feedback:read", async ({ key, db, params }) => {
  return json(await getFeedback(db, key, params.id ?? ""));
});

/** Public REST API: triage a post, e.g. `{ "status": "planned", "addTags": ["Bug"] }`. */
export const PATCH = withApiKey("feedback:write", async ({ req, key, db, params }) => {
  const body = await readBody(req, updateFeedbackSchema);
  return json(await updateFeedback(db, key, params.id ?? "", body));
});
