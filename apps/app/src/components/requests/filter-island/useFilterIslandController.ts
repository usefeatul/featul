"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";
import { getFilterIslandTransitions } from "@/components/requests/filter-island/constants";

type UseFilterIslandControllerOptions = {
  isVisible: boolean;
};

export function useFilterIslandController({
  isVisible,
}: UseFilterIslandControllerOptions) {
  const [expanded, setExpanded] = React.useState(false);
  const islandRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const collapse = React.useCallback(() => {
    setExpanded(false);
  }, []);

  const toggleExpanded = React.useCallback(() => {
    setExpanded((value) => !value);
  }, []);

  React.useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!islandRef.current?.contains(event.target as Node)) {
        collapse();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        collapse();
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [collapse, expanded]);

  React.useEffect(() => {
    if (!isVisible) {
      collapse();
    }
  }, [collapse, isVisible]);

  const transitions = React.useMemo(
    () => getFilterIslandTransitions(reduceMotion),
    [reduceMotion],
  );

  return {
    collapse,
    expanded,
    islandRef,
    reduceMotion,
    toggleExpanded,
    transitions,
  };
}
