"use client";

import * as React from "react";
import { isSafeImageUrl, isSafeParentOrigin } from "./origin";

export type WidgetMessageType =
  | "ready"
  | "close"
  | "brand"
  | "theme"
  | "panel"
  | "open-image"
  | "close-image";

const FRAME_SOURCE = "featul-widget-frame";
const HOST_SOURCE = "featul-widget";

export { isSafeImageUrl, isSafeParentOrigin };

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

export function isHostMessage(event: MessageEvent, parentOrigin: string) {
  if (!isSafeParentOrigin(parentOrigin)) return false;
  if (event.origin !== parentOrigin) return false;
  const data = event.data;
  return Boolean(data && typeof data === "object" && data.source === HOST_SOURCE);
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
    <MessagingContext.Provider value={isSafeParentOrigin(parentOrigin) ? parentOrigin : ""}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useParentOrigin() {
  return React.useContext(MessagingContext);
}
