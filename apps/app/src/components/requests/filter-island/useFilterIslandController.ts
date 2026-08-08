"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";
import { getFilterIslandTransitions } from "@/components/requests/filter-island/constants";

type UseFilterIslandControllerOptions = {
  isVisible: boolean;
  measureKey: string;
};

export function useFilterIslandController({
  isVisible,
  measureKey,
}: UseFilterIslandControllerOptions) {
  const [expanded, setExpanded] = React.useState(false);
  const islandRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>();
  const reduceMotion = useReducedMotion();

  const collapse = React.useCallback(() => {
    setExpanded(false);
  }, []);

  const toggleExpanded = React.useCallback(() => {
    setExpanded((value) => !value);
  }, []);

  React.useLayoutEffect(() => {
    if (!isVisible) return;

    const node = contentRef.current;
    if (!node) return;

    const measure = () => {
      const next = Math.ceil(node.getBoundingClientRect().width);
      setWidth((current) => (current === next ? current : next));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded, isVisible, measureKey]);

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
    contentRef,
    expanded,
    islandRef,
    reduceMotion,
    toggleExpanded,
    transitions,
    width,
  };
}
