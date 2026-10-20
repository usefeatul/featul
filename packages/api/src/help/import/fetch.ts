import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP, type LookupFunction } from "node:net";
import type { Readable } from "node:stream";
import zlib from "node:zlib";

const USER_AGENT = "FeatulHelpImport/1.0 (+https://featul.com)";
const MAX_REDIRECTS = 4;

function isPrivateV4(address: string): boolean {
  const [a = 0, b = 0, c = 0] = address.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

/** Eight 16-bit groups, expanding "::" and a trailing dotted IPv4. */
function ipv6Groups(address: string): number[] | null {
  let value = address.toLowerCase().split("%")[0]!;
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(value);
  if (dotted) {
    const [a = 0, b = 0, c = 0, d = 0] = dotted[1]!.split(".").map(Number);
    value = `${value.slice(0, dotted.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head = "", tail] = value.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const fill = tail === undefined ? 0 : 8 - left.length - right.length;
  if (fill < 0) return null;
  const groups = [...left, ...Array<string>(fill).fill("0"), ...right].map((g) => parseInt(g, 16));
  return groups.length === 8 && groups.every((g) => Number.isInteger(g) && g >= 0 && g <= 0xffff) ? groups : null;
}

const v4FromGroups = (hi: number, lo: number) => `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;

/**
 * Loopback, private, link-local, CGNAT, multicast and reserved ranges. IPv6 is allowed only in
 * global unicast (2000::/3), and IPv4 embedded in IPv6 (mapped, 6to4) is checked as IPv4.
 */
export function isPrivateAddress(address: string): boolean {
  const host = address.replace(/^\[|\]$/g, "");
  if (isIP(host) === 4) return isPrivateV4(host);
  if (isIP(host) !== 6) return true;
  const g = ipv6Groups(host);
  if (!g) return true;
  const [g0 = 0, g1 = 0, g2 = 0, , , g5 = 0, g6 = 0, g7 = 0] = g;
  // ::ffff:a.b.c.d answers like the IPv4 address it wraps.
  if (g.slice(0, 5).every((x) => x === 0) && g5 === 0xffff) return isPrivateV4(v4FromGroups(g6, g7));
  if ((g0 & 0xe000) !== 0x2000) return true;
  if (g0 === 0x2002) return isPrivateV4(v4FromGroups(g1, g2));
  // Teredo and documentation ranges.
  if (g0 === 0x2001 && (g1 === 0 || g1 === 0xdb8)) return true;
  return false;
}

export class ImportFetchError extends Error {}

/**
 * Resolves for the connection itself and refuses private answers, so a host can't pass the
 * check with a public address and then connect to a private one (DNS rebinding).
 */
const publicLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { all: true, family: options.family }).then(
    (addresses) => {
      if (addresses.length === 0) return callback(new ImportFetchError(`Couldn't find ${hostname}`), "", 0);
      if (addresses.some((a) => isPrivateAddress(a.address))) {
        return callback(new ImportFetchError("That address isn't public"), "", 0);
      }
      if (options.all) return (callback as (e: null, a: typeof addresses) => void)(null, addresses);
      callback(null, addresses[0]!.address, addresses[0]!.family);
    },
    (error: NodeJS.ErrnoException) => callback(error, "", 0),
  );
};

/** Public http(s) URLs only; IP literals are checked here, hostnames when connecting. */
function assertPublicUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ImportFetchError("Only http and https links can be scanned");
  }
  if (url.username || url.password) throw new ImportFetchError("Links with credentials can't be scanned");
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new ImportFetchError("Links on custom ports can't be scanned");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new ImportFetchError("That address isn't public");
  }
  if (isIP(host) && isPrivateAddress(host)) throw new ImportFetchError("That address isn't public");
}

function get(url: URL, headers: Record<string, string>, signal: AbortSignal) {
  const client = url.protocol === "https:" ? https : http;
  return new Promise<http.IncomingMessage>((resolve, reject) => {
    const req = client.request(url, { method: "GET", headers, lookup: publicLookup, signal, agent: false }, resolve);
    req.on("error", reject);
    req.end();
  });
}

function decoded(res: http.IncomingMessage): Readable {
  const encoding = String(res.headers["content-encoding"] ?? "").trim().toLowerCase();
  if (encoding === "gzip" || encoding === "x-gzip") return res.pipe(zlib.createGunzip());
  if (encoding === "deflate") return res.pipe(zlib.createInflate());
  if (encoding === "br") return res.pipe(zlib.createBrotliDecompress());
  return res;
}

/**
 * Fetches a public URL with redirects re-checked hop by hop, a byte cap (after decompression)
 * and a timeout. Returns null for non-2xx responses so callers can skip a page without failing
 * the scan; `onStatus` sees the final status for callers that need to tell failures apart.
 */
export async function safeFetchText(
  input: string,
  {
    maxBytes = 2_000_000,
    timeoutMs = 10_000,
    accept = "text/html,*/*;q=0.8",
    githubToken,
    onStatus,
  }: {
    maxBytes?: number;
    timeoutMs?: number;
    accept?: string;
    githubToken?: string;
    onStatus?: (status: number) => void;
  } = {},
): Promise<{ url: string; text: string; contentType: string } | null> {
  let url = new URL(input);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      assertPublicUrl(url);
      const res = await get(
        url,
        {
          "User-Agent": USER_AGENT,
          Accept: accept,
          "Accept-Encoding": "gzip, deflate, br",
          // Never forward a token past GitHub's API host, including on redirects.
          ...(githubToken && url.hostname === "api.github.com" ? { Authorization: `Bearer ${githubToken}` } : {}),
        },
        controller.signal,
      );
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400) {
        const location = res.headers.location;
        res.destroy();
        if (!location) return null;
        url = new URL(location, url);
        continue;
      }
      onStatus?.(status);
      if (status < 200 || status >= 300) {
        res.destroy();
        return null;
      }
      const body = decoded(res);
      const chunks: Buffer[] = [];
      let bytes = 0;
      for await (const chunk of body) {
        const buffer = chunk as Buffer;
        chunks.push(buffer);
        bytes += buffer.byteLength;
        if (bytes >= maxBytes) break;
      }
      body.destroy();
      res.destroy();
      const text = new TextDecoder().decode(Buffer.concat(chunks).subarray(0, maxBytes));
      return { url: url.toString(), text, contentType: String(res.headers["content-type"] ?? "") };
    }
    return null;
  } catch (error) {
    if (error instanceof ImportFetchError) throw error;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** "clerk.com" → https://clerk.com/; rejects anything that isn't a plausible public site. */
export function normalizeSiteUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = "";
  if (!url.hostname.includes(".")) throw new ImportFetchError("Enter a full website address, like example.com");
  return url;
}
