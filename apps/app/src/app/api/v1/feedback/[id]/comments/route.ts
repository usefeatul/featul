import { json, readBody, withApiKey } from "@featul/api/public-api/http";
import { createCommentSchema, createFeedbackComment } from "@featul/api/public-api/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public REST API: add an internal note (default) or a public reply to a post. */
export const POST = withApiKey("feedback:write", async ({ req, key, db, params }) => {
  const body = await readBody(req, createCommentSchema);
  return json(await createFeedbackComment(db, key, params.id ?? "", body), 201);
});
