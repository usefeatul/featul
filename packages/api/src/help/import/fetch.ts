import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const USER_AGENT = "FeatulHelpImport/1.0 (+https://featul.com)";
const MAX_REDIRECTS = 4;

/** Loopback, private, link-local, CGNAT, multicast and reserved ranges, v4 and v6. */
function isPrivateAddress(address: string): boolean {
  const v4 = address.startsWith("::ffff:") ? address.slice(7) : address;
  if (isIP(v4) === 4) {
    const [a = 0, b = 0] = v4.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = address.toLowerCase();
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe8") ||
    v6.startsWith("fe9") ||
    v6.startsWith("fea") ||
    v6.startsWith("feb") ||
    v6.startsWith("ff")
  );
}

export class ImportFetchError extends Error {}

/** Public http(s) URLs only; the host must resolve exclusively to public addresses. */
async function assertPublicUrl(url: URL) {
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
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new ImportFetchError(`Couldn't find ${host}`);
  if (addresses.some((a) => isPrivateAddress(a.address))) {
    throw new ImportFetchError("That address isn't public");
  }
}

/**
 * Fetches a public URL with redirects re-checked hop by hop, a byte cap and a timeout.
 * Returns null for non-2xx responses so callers can skip a page without failing the scan.
 */
export async function safeFetchText(
  input: string,
  { maxBytes = 2_000_000, timeoutMs = 10_000, accept = "text/html,*/*;q=0.8" } = {},
): Promise<{ url: string; text: string; contentType: string } | null> {
  let url = new URL(input);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublicUrl(url);
      const res = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT, Accept: accept },
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        await res.body?.cancel();
        if (!location) return null;
        url = new URL(location, url);
        continue;
      }
      if (!res.ok || !res.body) {
        await res.body?.cancel();
        return null;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let bytes = 0;
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        text += decoder.decode(value, { stream: true });
        if (bytes >= maxBytes) {
          await reader.cancel();
          break;
        }
      }
      text += decoder.decode();
      return { url: url.toString(), text, contentType: res.headers.get("content-type") ?? "" };
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
