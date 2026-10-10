const MAX_BYTES = 256 * 1024;

export function consentTarget(
  base: string,
  path: string[],
  search: string,
): URL {
  const upstream = new URL(base);
  if (
    !["https:", "http:"].includes(upstream.protocol) ||
    upstream.username ||
    upstream.password
  ) {
    throw new Error("Invalid consent upstream");
  }
  // Next decodes catch-all parameters. Never resolve those values as URLs.
  if (!path.length || path.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))) {
    throw new Error("Invalid consent path");
  }
  upstream.pathname = `${upstream.pathname.replace(/\/+$/, "")}/${path.map(encodeURIComponent).join("/")}`;
  upstream.search = search;
  upstream.hash = "";
  return upstream;
}

export function consentHeaders(source: Headers): Headers {
  const result = new Headers();
  for (const name of ["accept", "accept-language", "content-type", "origin"]) {
    const value = source.get(name);
    if (value) result.set(name, value);
  }
  return result;
}

export async function boundedBody(
  stream: ReadableStream<Uint8Array> | null,
): Promise<Uint8Array | undefined> {
  if (!stream) return undefined;
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new RangeError("Consent payload too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
