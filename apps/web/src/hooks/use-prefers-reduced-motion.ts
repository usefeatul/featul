import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const init = () => setReduced(media.matches);
    init();
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
    if (typeof media.addListener === "function") {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
    return undefined;
  }, []);
  return reduced;
}
