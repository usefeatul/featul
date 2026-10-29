import { z } from "zod";
import { db } from "@featul/db";
import { limitApiIp, limitApiKey } from "../services/ratelimiter";
import {
  ApiError,
  authenticateApiKey,
  hashApiKey,
  readBearerToken,
  requireScope,
  type ApiKeyContext,
  type ApiKeyScope,
} from "./keys";

type RouteContext = { params: Promise<Record<string, string>> };
type Handler = (args: {
  req: Request;
  key: ApiKeyContext;
  db: any;
  params: Record<string, string>;
}) => Promise<Response>;

function errorResponse(status: number, code: string, message: string, headers?: HeadersInit) {
  return Response.json({ error: { code, message } }, { status, headers });
}

export function json(data: unknown, status = 200) {
  return Response.json({ data }, { status });
}

/** Parses a JSON body, turning malformed JSON and schema failures into 400s. */
export async function readBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON");
  }
  return parse(schema, raw);
}

export function readQuery<T extends z.ZodTypeAny>(req: Request, schema: T): z.infer<T> {
  return parse(schema, Object.fromEntries(new URL(req.url).searchParams));
}

function parse<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const message = result.error.issues
    .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
    .join("; ");
  throw new ApiError(400, "invalid_request", message);
}

/**
 * Public REST handler: API key auth, a per-key rate limit, a scope check, and JSON errors.
 * `scope: null` skips the check for handlers that check scopes per operation (the MCP server).
 */
export function withApiKey(scope: ApiKeyScope | null, handler: Handler) {
  return async (req: Request, context?: RouteContext) => {
    try {
      // Both limits run before any database work: per IP (stops floods of made-up keys) and per key.
      const token = readBearerToken(req);
      for (const limit of [await limitApiIp(req), ...(token ? [await limitApiKey(hashApiKey(token))] : [])]) {
        if (limit.enabled && !limit.success) {
          const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000));
          return errorResponse(429, "rate_limited", "Too many requests. Please try again shortly.", {
            "Retry-After": String(retryAfter),
          });
        }
      }
      const key = await authenticateApiKey(db, req);
      if (scope) requireScope(key, scope);
      const params = (await context?.params) ?? {};
      return await handler({ req, key, db, params });
    } catch (error) {
      if (error instanceof ApiError) return errorResponse(error.status, error.code, error.message);
      if (error instanceof z.ZodError) {
        return errorResponse(400, "invalid_request", error.issues.map((issue) => issue.message).join("; "));
      }
      console.error("[public-api] request failed", error);
      return errorResponse(500, "internal_error", "Something went wrong");
    }
  };
}
