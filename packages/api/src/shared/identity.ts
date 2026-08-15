import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { WidgetIdentity } from "../router/widget/schema";

export const WIDGET_IDENTITY_TTL_SECONDS = 5 * 60;
const WIDGET_IDENTITY_MAX_FUTURE_SECONDS = 10 * 60;
const WIDGET_IDENTITY_CLOCK_SKEW_SECONDS = 30;

export function createWidgetSecret() {
  return randomBytes(32).toString("hex");
}

export function widgetIdentityPayload(
  workspaceId: string,
  identity: Omit<WidgetIdentity, "signature">,
) {
  return JSON.stringify([
    1,
    workspaceId.trim(),
    identity.id.trim(),
    identity.email.trim().toLowerCase(),
    identity.name?.trim() || "",
    identity.avatar?.trim() || "",
    identity.expiresAt,
  ]);
}

export function signWidgetIdentity(
  secret: string,
  workspaceId: string,
  identity: Omit<WidgetIdentity, "signature">,
) {
  return createHmac("sha256", secret)
    .update(widgetIdentityPayload(workspaceId, identity))
    .digest("hex");
}

function safeEqualString(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isVerifiedIdentity(
  identity: WidgetIdentity | undefined,
  secret: string | null | undefined,
  workspaceId: string,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  if (!identity?.id || !identity.email || !identity.signature || !secret)
    return false;
  if (identity.expiresAt < nowSeconds - WIDGET_IDENTITY_CLOCK_SKEW_SECONDS)
    return false;
  if (identity.expiresAt > nowSeconds + WIDGET_IDENTITY_MAX_FUTURE_SECONDS)
    return false;
  const expected = signWidgetIdentity(secret, workspaceId, identity);
  return safeEqualString(identity.signature, expected);
}

export function isSafeWidgetParentOrigin(
  value?: string | null,
): value is string {
  const origin = String(value || "").trim();
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (origin !== url.origin) return false;
    if (url.protocol === "https:") return true;
    if (url.protocol !== "http:") return false;
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function normalizeWidgetOrigin(value: string) {
  const origin = new URL(value.trim()).origin;
  if (!isSafeWidgetParentOrigin(origin)) {
    throw new Error(
      "Widget origins must use HTTPS, except localhost development origins",
    );
  }
  return origin;
}

export function isAllowedWidgetMessageOrigin(
  eventOrigin: string,
  parentOrigin: string,
) {
  return (
    isSafeWidgetParentOrigin(parentOrigin) &&
    isSafeWidgetParentOrigin(eventOrigin) &&
    eventOrigin === parentOrigin
  );
}

export function buildWidgetOriginAllowlist(input: {
  slug: string;
  workspaceDomain?: string | null;
  customDomain?: string | null;
  verifiedHosts?: string[];
  appOrigin?: string | null;
  configuredOrigins?: string[];
  includeDevOrigins?: boolean;
}) {
  const origins = new Set<string>();
  const addHost = (host: string, protocol: "http:" | "https:" = "https:") => {
    const clean = host
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .trim()
      .toLowerCase();
    if (!clean) return;
    origins.add(`${protocol}//${clean}`);
  };

  addHost(`${input.slug}.featul.com`);
  if (input.workspaceDomain) addHost(input.workspaceDomain);
  if (input.customDomain) addHost(input.customDomain);
  for (const host of input.verifiedHosts || []) addHost(host);
  if (input.appOrigin && isSafeWidgetParentOrigin(input.appOrigin)) {
    origins.add(input.appOrigin);
  }
  for (const origin of input.configuredOrigins || []) {
    if (isSafeWidgetParentOrigin(origin)) origins.add(origin);
  }
  if (input.includeDevOrigins) {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return [...origins];
}
