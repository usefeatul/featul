"use client";

import { useEffect, useState, type RefObject } from "react";

interface Section {
  element: HTMLElement;
  title: string;
  preview: string;
}

const text = (element: Element) =>
  element.textContent?.replace(/\s+/g, " ").trim() ?? "";

/** Observe rendered blocks so manual edits, undo, and AI streaming stay in sync. */
export function useChangelogTimeline(
  scrollRef: RefObject<HTMLElement | null>,
  title: string,
) {
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    let current: Section[] = [];
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const updateActive = () => {
      frame = 0;
      const threshold = root.getBoundingClientRect().top + 72;
      let index = 0;
      current.forEach((section, i) => {
        if (section.element.getBoundingClientRect().top <= threshold) index = i;
      });
      if (
        root.scrollHeight > root.clientHeight &&
        root.scrollTop + root.clientHeight >= root.scrollHeight - 2
      ) {
        index = Math.max(0, current.length - 1);
      }
      setActive(index);
    };
    const scheduleActive = () => {
      if (!frame) frame = requestAnimationFrame(updateActive);
    };
    const read = () => {
      const editor = root.querySelector<HTMLElement>(".ProseMirror");
      const blocks = Array.from(editor?.children ?? []).filter(
        (block): block is HTMLElement => block instanceof HTMLElement,
      );
      const headings = blocks.filter((block) => /^H[1-6]$/.test(block.tagName));
      const targets = headings.length
        ? headings
        : blocks.filter(
            (block) => text(block) || block.querySelector("img,video,hr"),
          );
      const titleElement = root.querySelector<HTMLTextAreaElement>("textarea");
      current = titleElement
        ? [
            {
              element: titleElement,
              title: title.trim() || "Untitled changelog",
              preview: "Start of your changelog",
            },
          ]
        : [];
      targets.forEach((element) => {
        const index = blocks.indexOf(element);
        const following: string[] = [];
        if (headings.length) {
          for (let i = index + 1; i < blocks.length; i++) {
            const block = blocks[i]!;
            if (/^H[1-6]$/.test(block.tagName)) break;
            following.push(text(block));
            if (following.join(" ").length >= 240) break;
          }
        }
        const content = text(element);
        current.push({
          element,
          title:
            content.slice(0, 100) ||
            element.querySelector("img")?.alt ||
            "Media block",
          preview: (headings.length ? following.join(" ") : content).slice(
            0,
            240,
          ),
        });
      });
      setSections(current);
      updateActive();
      onSelection();
    };
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(read, 120);
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    const resize = new ResizeObserver(scheduleActive);
    resize.observe(root);
    const onSelection = () => {
      const anchor = window.getSelection()?.anchorNode;
      if (!anchor || !root.querySelector(".ProseMirror")?.contains(anchor))
        return;
      let index = 0;
      current.forEach((section, i) => {
        if (
          section.element.contains(anchor) ||
          section.element.compareDocumentPosition(anchor) &
            Node.DOCUMENT_POSITION_FOLLOWING
        )
          index = i;
      });
      setActive(index);
    };
    root.addEventListener("scroll", scheduleActive, { passive: true });
    document.addEventListener("selectionchange", onSelection);
    read();
    return () => {
      observer.disconnect();
      resize.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      root.removeEventListener("scroll", scheduleActive);
      document.removeEventListener("selectionchange", onSelection);
    };
  }, [scrollRef, title]);

  const jumpTo = (index: number) => {
    const root = scrollRef.current;
    const section = sections[index];
    if (!root || !section?.element.isConnected) return;
    root.scrollTo({
      top: Math.max(
        0,
        root.scrollTop +
          section.element.getBoundingClientRect().top -
          root.getBoundingClientRect().top -
          48,
      ),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setActive(index);
  };

  return { sections, active, jumpTo };
}
