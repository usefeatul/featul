import { HTTPException } from "hono/http-exception";

/** Bound actual streamed bytes, including requests without Content-Length. */
export async function readBoundedJson(request: Request, maxBytes = 256 * 1024): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new HTTPException(400, { message: "Invalid request" });
  let bytes = 0;
  let body = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new HTTPException(413, { message: "Request too large" });
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body);
  } finally { reader.releaseLock(); }
}
