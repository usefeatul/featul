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
