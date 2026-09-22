import { normalizeInternalRedirectPath } from "@/utils/path";

const FALLBACK_REDIRECT = "/start";

/** True for localhost, the app host, or sibling subdomains of the app base. */
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

/** Safe internal path or allowlisted absolute URL. Open redirects become `""`. */
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

/** Post-auth destination, or `/start` when the param is unsafe/empty. */
export function resolveAuthRedirect(raw: string, fallback: string = FALLBACK_REDIRECT) {
  const normalized = normalizeRedirectParam(raw);
  return normalized || fallback;
}
