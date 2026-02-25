import { normalizeInternalRedirectPath } from "@/utils/redirect-path";

const FALLBACK_REDIRECT = "/start";

function isAllowedRedirectHost(hostname: string) {
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) {
    return true;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  try {
    const appHost = new URL(appUrl).hostname;
    if (hostname === appHost) return true;
    const baseParts = appHost.split(".").slice(-2).join(".");
    if (baseParts && (hostname === baseParts || hostname.endsWith(`.${baseParts}`))) {
      return true;
    }
  } catch {
    // Ignore invalid app URL
  }
  if (typeof window !== "undefined" && hostname === window.location.hostname) {
    return true;
  }
  return false;
}

export function normalizeRedirectParam(raw: string) {
  if (!raw) return "";
  const internalPath = normalizeInternalRedirectPath(raw);
  if (internalPath) return internalPath;
  if (raw.startsWith("/")) return "";
  try {
    const url = new URL(raw);
    return isAllowedRedirectHost(url.hostname) ? url.toString() : "";
  } catch {
    return "";
  }
}

export function resolveAuthRedirect(raw: string, fallback: string = FALLBACK_REDIRECT) {
  const normalized = normalizeRedirectParam(raw);
  return normalized || fallback;
}
