"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { PostDeletedEventDetail } from "@/types/events";

export function WorkspaceEvents({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const normalizeStatus = React.useCallback(
    (value: string | null | undefined): string | null => {
      const raw = (value || "").trim().toLowerCase();
      if (!raw) return null;
      const t = raw.replace(/-/g, "");
      const map: Record<string, string> = {
        pending: "pending",
        review: "review",
        planned: "planned",
        progress: "progress",
        completed: "completed",
        closed: "closed",
      };
      return map[t] || raw;
    },
    [],
  );

  React.useEffect(() => {
    if (!slug) return;
    if (typeof window === "undefined") return;
    const handlePostDeleted = (event: Event) => {
      const detail = (event as CustomEvent<PostDeletedEventDetail>).detail;
      if (!detail) {
        queryClient.invalidateQueries({ queryKey: ["status-counts", slug] });
        return;
      }
      if (detail.workspaceSlug && detail.workspaceSlug !== slug) return;
      const key = normalizeStatus(detail.status || null);
      if (!key) {
        queryClient.invalidateQueries({ queryKey: ["status-counts", slug] });
        return;
      }
      try {
        queryClient.setQueryData<Record<string, number> | null>(
          ["status-counts", slug],
          (prev) => {
            if (!prev) return prev;
            const next: Record<string, number> = { ...prev };
            const current = next[key];
            if (typeof current === "number" && current > 0) {
              next[key] = current - 1;
            }
            return next;
          },
        );
      } catch {
        // ignore
      }
      try {
        queryClient.invalidateQueries({ queryKey: ["status-counts", slug] });
      } catch {
        // ignore
      }
    };
    window.addEventListener("post:deleted", handlePostDeleted);
    return () => {
      window.removeEventListener("post:deleted", handlePostDeleted);
    };
  }, [slug, queryClient, normalizeStatus]);

  React.useEffect(() => {
    if (!slug) return;
    if (typeof window === "undefined") return;

    const isEditableElement = (element: HTMLElement | null) => {
      if (!element) return false;
      const role = element.getAttribute("role") || "";
      const tag = element.tagName;
      return (
        role === "textbox" ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        element.isContentEditable
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey) return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (isEditableElement(target) || isEditableElement(activeElement)) return;

      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      const usesPlatformModifier =
        (event.metaKey && !event.ctrlKey) ||
        (event.ctrlKey && !event.metaKey);

      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && key === "g") {
        event.preventDefault();
        router.push(`/workspaces/${slug}`);
        return;
      }

      if (usesPlatformModifier && !event.shiftKey && key === "m") {
        event.preventDefault();
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resolvedTheme, router, setTheme, slug]);

  return null;
}
