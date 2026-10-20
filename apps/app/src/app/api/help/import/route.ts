import { createHelpImportResponse } from "@featul/api/help/import/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Workspace managers only: scans a website or GitHub repo and streams draft articles. */
export async function POST(req: Request) {
  return createHelpImportResponse(req);
}
