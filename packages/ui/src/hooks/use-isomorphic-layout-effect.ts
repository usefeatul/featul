import { useEffect, useLayoutEffect } from "react";

/**
 * useIsomorphicLayoutEffect
 *
 * Uses `useLayoutEffect` on the client and falls back to `useEffect` on the server.
 * This avoids React warnings about using layout effects during SSR.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;





