import { json, readBody, readQuery, withApiKey } from "@featul/api/public-api/http";
import {
  listChangelogEntries,
  upsertChangelogEntry,
  listEntriesSchema,
  upsertEntrySchema,
} from "@featul/api/public-api/changelog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public REST API: list changelog entries. */
export const GET = withApiKey("changelog:read", async ({ req, key, db }) => {
  const query = readQuery(req, listEntriesSchema);
  return json(await listChangelogEntries(db, key, query));
});

/** Public REST API: create an entry, or update the one with the same `externalId`. */
export const POST = withApiKey("changelog:write", async ({ req, key, db }) => {
  const body = await readBody(req, upsertEntrySchema);
  const { created, entry } = await upsertChangelogEntry(db, key, body);
  return json(entry, created ? 201 : 200);
});
