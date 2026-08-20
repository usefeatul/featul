const INVALID_ORIGIN_WARNINGS = new Set<string>();

type NormalizeOriginOptions = {
  enforceProductionRestrictions?: boolean;
};

function splitOriginPatterns(value: string): string[] {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isLocalDevHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".localhost")
  );
}

function normalizeWildcardOriginPattern(
  pattern: string,
  options: NormalizeOriginOptions = {},
): string | null {
  const match = pattern.match(/^(https?):\/\/\*\.([^/?#:]+)(:\d+)?\/?$/i);
  if (!match) return null;

  const [, rawProtocol, rawSuffix, rawPort] = match;
  if (!rawProtocol || !rawSuffix) return null;

  const protocol = `${rawProtocol.toLowerCase()}:`;
  const suffix = rawSuffix.toLowerCase();
  const port = rawPort || "";

  if (!suffix || suffix.includes("*")) return null;
  if (suffix !== "localhost" && !suffix.includes(".")) return null;

  const enforceProductionRestrictions =
    options.enforceProductionRestrictions ??
    process.env.NODE_ENV === "production";

  if (enforceProductionRestrictions) {
    if (protocol !== "https:") return null;
    if (isLocalDevHost(suffix)) return null;
  }

  return `${protocol}//*.${suffix}${port}`;
}

function normalizeOriginPattern(
  pattern: string,
  options: NormalizeOriginOptions = {},
): string | null {
  const trimmed = pattern.trim();
  if (!trimmed) return null;
  if (trimmed === "*" || trimmed === "http://*" || trimmed === "https://*") {
    return null;
  }

  const wildcardOrigin = normalizeWildcardOriginPattern(trimmed, options);
  if (wildcardOrigin) {
    return wildcardOrigin;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") return null;

  if (
    (parsed.pathname && parsed.pathname !== "/") ||
    parsed.search ||
    parsed.hash ||
    parsed.username ||
    parsed.password
  ) {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || host === "*") return null;

  if (host.includes("*")) {
    if (!host.startsWith("*.")) return null;
    const suffix = host.slice(2);
    if (!suffix || suffix.includes("*")) return null;
    if (suffix !== "localhost" && !suffix.includes(".")) return null;
  }

  const enforceProductionRestrictions =
    options.enforceProductionRestrictions ??
    process.env.NODE_ENV === "production";

  if (enforceProductionRestrictions) {
    if (protocol !== "https:") return null;
    const hostWithoutWildcard = host.startsWith("*.") ? host.slice(2) : host;
    if (isLocalDevHost(hostWithoutWildcard)) return null;
  }

  const port = parsed.port ? `:${parsed.port}` : "";
  return `${protocol}//${host}${port}`;
}

type ParsedTrustedOrigins = {
  invalid: string[];
  origins: string[];
};

function parseTrustedOrigins(rawValue: string): ParsedTrustedOrigins {
  const invalid: string[] = [];
  const origins: string[] = [];

  for (const pattern of splitOriginPatterns(rawValue)) {
    const normalized = normalizeOriginPattern(pattern);
    if (!normalized) {
      invalid.push(pattern);
      continue;
    }
    origins.push(normalized);
  }

  return {
    invalid,
    origins: Array.from(new Set(origins)),
  };
}

function isProductionRestrictedPattern(pattern: string): boolean {
  if (process.env.NODE_ENV !== "production") return false;

  return (
    normalizeOriginPattern(pattern, {
      enforceProductionRestrictions: false,
    }) !== null &&
    normalizeOriginPattern(pattern, { enforceProductionRestrictions: true }) ===
      null
  );
}

function reportInvalidPatterns(envName: string, invalid: string[]): void {
  if (invalid.length === 0) return;

  const ignoredProductionOnly = invalid.filter((pattern) =>
    isProductionRestrictedPattern(pattern),
  );
  if (ignoredProductionOnly.length > 0) {
    const warning = `Ignoring non-production trusted origin entries in ${envName}: ${ignoredProductionOnly.join(", ")}`;
    if (!INVALID_ORIGIN_WARNINGS.has(warning)) {
      INVALID_ORIGIN_WARNINGS.add(warning);
      console.warn(warning);
    }
  }

  const trulyInvalid = invalid.filter(
    (pattern) => !ignoredProductionOnly.includes(pattern),
  );
  if (trulyInvalid.length === 0) return;

  const message = `Invalid trusted origin entries in ${envName}: ${trulyInvalid.join(", ")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }

  if (INVALID_ORIGIN_WARNINGS.has(message)) return;
  INVALID_ORIGIN_WARNINGS.add(message);
  console.warn(
    `${message}. Ignoring invalid entries in non-production environments.`,
  );
}

export function getValidatedTrustedOrigins(
  envName: string,
  rawValue?: string,
): string[] {
  const parsed = parseTrustedOrigins(rawValue ?? process.env[envName] ?? "");
  reportInvalidPatterns(envName, parsed.invalid);
  return parsed.origins;
}

export function isConfiguredTrustedOrigin(
  origin: string,
  trustedOriginPatterns: string[],
): boolean {
  const value = String(origin || "").trim();
  if (!value) return false;

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(value);
  } catch {
    return false;
  }

  const target = parsedOrigin.origin;
  for (const pattern of trustedOriginPatterns) {
    const regex = patternToRegex(pattern);
    if (regex && regex.test(target)) return true;
  }

  return false;
}

function patternToRegex(originPattern: string): RegExp | null {
  const trimmed = originPattern.trim();
  if (!trimmed) return null;

  if (!trimmed.includes("*")) {
    return new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
  }

  const escaped = trimmed
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, ".*");

  return new RegExp(`^${escaped}$`);
}
