import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { WidgetIdentity } from "../router/widget/schema";

export function createWidgetSecret() {
  return randomBytes(32).toString("hex");
}

export function widgetIdentityPayload(id: string, email: string) {
  return `${id.trim()}:${email.trim().toLowerCase()}`;
}

export function signWidgetIdentity(secret: string, id: string, email: string) {
  return createHmac("sha256", secret).update(widgetIdentityPayload(id, email)).digest("hex");
}

function safeEqualString(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isVerifiedIdentity(identity: WidgetIdentity | undefined, secret: string | null | undefined) {
  if (!identity?.id || !identity.email || !identity.signature || !secret) return false;
  const expected = signWidgetIdentity(secret, identity.id, identity.email);
  return safeEqualString(identity.signature, expected);
}

export function isSafeWidgetParentOrigin(value?: string | null): value is string {
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

export function isAllowedWidgetMessageOrigin(eventOrigin: string, parentOrigin: string) {
  return (
    isSafeWidgetParentOrigin(parentOrigin) &&
    isSafeWidgetParentOrigin(eventOrigin) &&
    eventOrigin === parentOrigin
  );
}

export function buildWidgetOriginAllowlist(input: {
  slug: string;
  customDomain?: string | null;
  verifiedHosts?: string[];
  appOrigin?: string | null;
}) {
  const origins = new Set<string>();
  const addHost = (host: string, protocol: "http:" | "https:" = "https:") => {
    const clean = host.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim().toLowerCase();
    if (!clean) return;
    origins.add(`${protocol}//${clean}`);
  };

  addHost(`${input.slug}.featul.com`);
  if (input.customDomain) addHost(input.customDomain);
  for (const host of input.verifiedHosts || []) addHost(host);
  if (input.appOrigin && isSafeWidgetParentOrigin(input.appOrigin)) {
    origins.add(input.appOrigin);
  }
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  return [...origins];
}
