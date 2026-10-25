const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function getSafeHttpUrlFromString(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (isSafeHttpUrl(trimmed)) return trimmed;

  try {
    if (trimmed.includes(".") && !trimmed.includes(" ")) {
      const withProtocol = new URL(`https://${trimmed}`).toString();
      return isSafeHttpUrl(withProtocol) ? withProtocol : null;
    }
  } catch {
    return null;
  }

  return null;
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

/**
 * Image sources must be HTTPS (or HTTP on localhost for development).
 * data:, blob:, javascript: and relative sources are dropped.
 */
export function getSafeImageSrc(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") return trimmed;
    if (parsed.protocol === "http:" && isLocalHostname(parsed.hostname)) {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}
