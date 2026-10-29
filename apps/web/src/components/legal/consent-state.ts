import { useSyncExternalStore } from "react";

/**
 * The c15t consent stack loads after hydration (see consent.tsx). This tiny store lets
 * always-rendered UI, like the preferred-source button, read its state without pulling
 * c15t into the critical bundle.
 */
type ConsentState = {
  functionalityAllowed: boolean;
  openDialog: (() => void) | null;
};

let state: ConsentState = { functionalityAllowed: false, openDialog: null };
/** A dialog request made before c15t finished loading; the bridge opens it on mount. */
let dialogRequested = false;
const listeners = new Set<() => void>();

export function setConsentState(next: Partial<ConsentState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function takeDialogRequest() {
  const requested = dialogRequested;
  dialogRequested = false;
  return requested;
}

export function openConsentDialog() {
  if (state.openDialog) state.openDialog();
  else dialogRequested = true;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useFunctionalityAllowed() {
  return useSyncExternalStore(
    subscribe,
    () => state.functionalityAllowed,
    () => false,
  );
}
