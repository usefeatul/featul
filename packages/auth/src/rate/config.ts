const TRUTHY_ENV_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSY_ENV_VALUES = new Set(["0", "false", "no", "off"]);

function readBooleanEnv(name: string): boolean | undefined {
  const rawValue = process.env[name];
  if (typeof rawValue !== "string") return undefined;

  const normalizedValue = rawValue.trim().toLowerCase();
  if (!normalizedValue) return undefined;
  if (TRUTHY_ENV_VALUES.has(normalizedValue)) return true;
  if (FALSY_ENV_VALUES.has(normalizedValue)) return false;

  return undefined;
}

export function isAuthRateLimitEnabled(): boolean {
  const authOverride = readBooleanEnv("AUTH_RATE_LIMIT_ENABLED");
  if (typeof authOverride === "boolean") return authOverride;

  const sharedOverride = readBooleanEnv("RATE_LIMIT_ENABLED");
  if (typeof sharedOverride === "boolean") return sharedOverride;

  return process.env.NODE_ENV === "production";
}
