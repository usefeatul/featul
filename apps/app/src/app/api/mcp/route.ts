import { withApiKey } from "@featul/api/public-api/http";
import { handleMcpRequest } from "@featul/api/public-api/mcp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Featul MCP server (Streamable HTTP, stateless) at `api.featul.com/mcp`, so Claude, Cursor and
 * other MCP clients can triage feedback and draft changelog entries. Scopes are checked per tool.
 */
export const POST = withApiKey(null, async ({ req, key, db }) => handleMcpRequest(req, db, key));

/**
 * Stateless: no server-sent event stream and no sessions to end. A 405 tells MCP clients so;
 * answering GET with a stream that closes right away makes them reconnect in a loop.
 */
function methodNotAllowed() {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed. Send JSON-RPC requests with POST." }, id: null },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;
