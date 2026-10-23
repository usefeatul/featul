import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Shared count of open overlays (dialogs, alert dialogs, sheets) that
 * ask the app behind them to zoom out. The app shell reads it through
 * `useBackgroundScaled` and animates itself; overlays register through
 * `useBackgroundScaleLock` while they are open.
 */
let openCount = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => openCount > 0;
const getServerSnapshot = () => false;

/** True while at least one overlay wants the background scaled down. */
export function useBackgroundScaled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Holds the background scaled down for as long as `active` is true. */
export function useBackgroundScaleLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    openCount += 1;
    emit();
    return () => {
      openCount -= 1;
      emit();
    };
  }, [active]);
}

/**
 * Mirrors an overlay root's open state without taking control of it: uses
 * `open` when controlled, otherwise follows `defaultOpen` and `onOpenChange`.
 * A change the consumer cancels (Base UI `eventDetails.cancel()`) is ignored.
 */
export function useOverlayOpenState<Args extends unknown[]>({
  open,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, ...args: Args) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;

  const handleOpenChange = useCallback(
    (next: boolean, ...args: Args) => {
      onOpenChange?.(next, ...args);
      const details = args[0] as { isCanceled?: boolean } | undefined;
      if (!details?.isCanceled) setUncontrolledOpen(next);
    },
    [onOpenChange],
  );

  return [isOpen, handleOpenChange] as const;
}
