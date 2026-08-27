"use client";

import * as React from "react";
import {
  isAllowedWidgetMessageOrigin,
  isExpectedWidgetMessageSource,
} from "@featul/widget/protocol";
import { isSafeImageUrl, isSafeParentOrigin } from "./origin";

export type WidgetMessageType =
  | "ready"
  | "close"
  | "brand"
  | "theme"
  | "panel"
  | "open-image"
  | "close-image"
  | "capture-screenshot";

const FRAME_SOURCE = "featul-widget-frame";
const HOST_SOURCE = "featul-widget";

export { isSafeImageUrl, isSafeParentOrigin };

/** postMessage to the host. No-ops on unsafe origins or SSR. */
export function postToParent(
  parentOrigin: string,
  type: WidgetMessageType,
  payload?: unknown,
) {
  if (typeof window === "undefined") return;
  if (!isSafeParentOrigin(parentOrigin)) return;
  window.parent.postMessage(
    {
      source: FRAME_SOURCE,
      type,
      payload,
    },
    parentOrigin,
  );
}

/** True when the event is a valid host→frame widget message. */
export function isHostMessage(event: MessageEvent, parentOrigin: string) {
  return readHostMessage(event, parentOrigin) !== null;
}

/** Validate origin, source, and `featul-widget` envelope. Else null. */
export function readHostMessage(
  event: MessageEvent,
  parentOrigin: string,
): { type: string; payload: unknown } | null {
  if (!isSafeParentOrigin(parentOrigin)) return null;
  if (!isAllowedWidgetMessageOrigin(event.origin, parentOrigin)) return null;
  if (
    typeof window !== "undefined" &&
    !isExpectedWidgetMessageSource(event.source, window.parent)
  ) {
    return null;
  }
  const data = event.data;
  if (!data || typeof data !== "object") return null;
  if (!("source" in data) || data.source !== HOST_SOURCE) return null;
  return {
    type: "type" in data && typeof data.type === "string" ? data.type : "",
    payload: "payload" in data ? data.payload : undefined,
  };
}

const MessagingContext = React.createContext<string>("");

export function MessagingProvider({
  parentOrigin,
  children,
}: {
  parentOrigin: string;
  children: React.ReactNode;
}) {
  return (
    <MessagingContext.Provider
      value={isSafeParentOrigin(parentOrigin) ? parentOrigin : ""}
    >
      {children}
    </MessagingContext.Provider>
  );
}

/** Safe parent origin from MessagingProvider, or empty if rejected. */
export function useParentOrigin() {
  return React.useContext(MessagingContext);
}
