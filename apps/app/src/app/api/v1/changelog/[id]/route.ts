import { json, readBody, withApiKey } from "@featul/api/public-api/http";
import {
  getChangelogEntry,
  updateChangelogEntry,
  updateEntrySchema,
} from "@featul/api/public-api/changelog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public REST API: fetch one changelog entry. */
export const GET = withApiKey("changelog:read", async ({ key, db, params }) => {
  return json(await getChangelogEntry(db, key, params.id ?? ""));
});

/** Public REST API: update fields on a changelog entry, e.g. `{ "status": "published" }`. */
export const PATCH = withApiKey("changelog:write", async ({ req, key, db, params }) => {
  const body = await readBody(req, updateEntrySchema);
  return json(await updateChangelogEntry(db, key, params.id ?? "", body));
});
