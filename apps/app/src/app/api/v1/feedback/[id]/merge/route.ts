import { json, readBody, withApiKey } from "@featul/api/public-api/http";
import { mergeFeedback, mergeFeedbackSchema } from "@featul/api/public-api/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public REST API: merge this post into `targetId` as a duplicate. */
export const POST = withApiKey("feedback:write", async ({ req, key, db, params }) => {
  const body = await readBody(req, mergeFeedbackSchema);
  return json(await mergeFeedback(db, key, params.id ?? "", body));
});
