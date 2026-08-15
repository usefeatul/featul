export const HOST_SOURCE = "featul-widget";
export const FRAME_SOURCE = "featul-widget-frame";

export type WidgetHostEvent = "ready" | "open" | "close";

export type WidgetMessage = {
  source: string;
  type: string;
  payload?: unknown;
};

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

export function readWidgetMessage(
  data: unknown,
  expectedSource: string,
): { type: string; payload: unknown } | null {
  if (!data || typeof data !== "object") return null;
  if (!("source" in data) || data.source !== expectedSource) return null;
  return {
    type: "type" in data && typeof data.type === "string" ? data.type : "",
    payload: "payload" in data ? data.payload : undefined,
  };
}

export function createWidgetEnvelope(source: string, type: string, payload?: unknown): WidgetMessage {
  return { source, type, payload };
}
