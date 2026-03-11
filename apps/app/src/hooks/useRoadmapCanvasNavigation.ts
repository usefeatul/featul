"use client";

import React from "react";

type ColumnElement = HTMLDivElement | null;
type ColumnRefMap = Record<string, ColumnElement>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function useRoadmapCanvasNavigation(statuses: readonly string[]) {
  const boardScrollRef = React.useRef<HTMLDivElement | null>(null);
  const columnRefs = React.useRef<ColumnRefMap>({});

  const setColumnRef = React.useCallback((status: string, node: ColumnElement) => {
    columnRefs.current[status] = node;
  }, []);

  const jumpToStatus = React.useCallback(
    (status: string) => {
      const container = boardScrollRef.current;
      const node = columnRefs.current[status];
      if (!container || !node) return;

      const statusIndex = statuses.indexOf(status);
      const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      let targetLeft = 0;

      if (statusIndex === statuses.length - 1) {
        targetLeft = maxLeft;
      } else if (statusIndex === 0) {
        targetLeft = 0;
      } else {
        const centeredTarget =
          node.offsetLeft - (container.clientWidth - node.offsetWidth) / 2;
        targetLeft = clamp(centeredTarget, 0, maxLeft);
      }

      container.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      });
    },
    [statuses],
  );

  const getCurrentStatusIndex = React.useCallback((): number => {
    const container = boardScrollRef.current;
    if (!container) return 0;

    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    let nearestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    statuses.forEach((status, index) => {
      const node = columnRefs.current[status];
      if (!node) return;

      const nodeCenter = node.offsetLeft + node.offsetWidth / 2;
      const distance = Math.abs(nodeCenter - viewportCenter);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }, [statuses]);

  return {
    boardScrollRef,
    setColumnRef,
    jumpToStatus,
    getCurrentStatusIndex,
  };
}

