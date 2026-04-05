"use client";

import React from "react";
import { createPortal } from "react-dom";
import { cn } from "@featul/ui/lib/utils";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { SearchIcon } from "@featul/ui/icons/search";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import {
  WORKSPACE_SHORTCUT_GROUP_ORDER,
  WORKSPACE_SHORTCUTS,
  WORKSPACE_SHORTCUTS_OPEN_EVENT,
} from "@/lib/keyboard-shortcuts";

const GROUP_LABELS: Record<string, string> = {
  "Global workspace": "General",
  Sidebar: "Navigation",
  "Lists and bulk actions": "Lists",
  "Request detail": "Request detail",
  "Roadmap navigation": "Roadmap",
};

const KEY_SYMBOLS: Record<string, string> = {
  Command: "⌘",
  Ctrl: "⌃",
  Shift: "⇧",
  Enter: "↵",
  Escape: "Esc",
  "Left Arrow": "←",
  "Right Arrow": "→",
};

function isEditableElement(element: HTMLElement | null) {
  if (!element) return false;
  const role = element.getAttribute("role");
  const tag = element.tagName;
  return (
    role === "textbox" ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    element.isContentEditable
  );
}

function formatShortcutKey(key: string) {
  return KEY_SYMBOLS[key] ?? key;
}

function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <span className="font-mono text-[12px] font-medium tracking-[-0.01em] text-muted-foreground">
      {keys.map(formatShortcutKey).join(" ")}
    </span>
  );
}

function ShortcutBindingStack({
  bindings,
}: {
  bindings: (typeof WORKSPACE_SHORTCUTS)[number]["bindings"];
}) {
  return (
    <div className="flex min-w-[132px] flex-col items-end gap-1">
      {bindings.map((binding, index) => (
        <div
          key={`${binding.label ?? "shared"}-${binding.keys.join("-")}-${index}`}
          className="flex items-center"
        >
          <ShortcutKeys keys={binding.keys} />
        </div>
      ))}
    </div>
  );
}

function filterShortcut(shortcut: (typeof WORKSPACE_SHORTCUTS)[number], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    shortcut.title,
    shortcut.description,
    shortcut.group,
    ...shortcut.bindings.flatMap((binding) => [
      binding.label ?? "",
      ...binding.keys,
    ]),
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export default function WorkspaceShortcutsDrawer() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(WORKSPACE_SHORTCUTS_OPEN_EVENT, handleOpen as EventListener);
    return () => {
      window.removeEventListener(WORKSPACE_SHORTCUTS_OPEN_EVENT, handleOpen as EventListener);
    };
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey) return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (isEditableElement(target) || isEditableElement(activeElement)) return;

      const usesPlatformModifier =
        (event.metaKey && !event.ctrlKey) || (event.ctrlKey && !event.metaKey);
      const slashPressed =
        event.code === "Slash" || event.key === "/" || event.key === "?";

      if (!usesPlatformModifier || !slashPressed) return;

      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const groupedShortcuts = WORKSPACE_SHORTCUT_GROUP_ORDER.map((group) => ({
    group,
    items: WORKSPACE_SHORTCUTS.filter(
      (shortcut) => shortcut.group === group && filterShortcut(shortcut, query),
    ),
  })).filter((section) => section.items.length > 0);

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close keyboard shortcuts"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/45 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-shortcuts-title"
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_48px_rgba(0,0,0,0.18)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.35)]",
          "top-4 right-4 bottom-4 left-4 sm:left-auto sm:w-[340px]",
          "transition-all duration-200 ease-out",
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-6 opacity-0",
        )}
      >
        <div className="flex flex-col gap-3 border-b border-border px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2
                id="workspace-shortcuts-title"
                className="text-sm font-semibold tracking-tight text-foreground"
              >
                Keyboard Shortcuts
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close keyboard shortcuts"
              onClick={() => setOpen(false)}
              className={cn(
                "size-7 cursor-pointer rounded-md bg-transparent p-0 text-muted-foreground shadow-none",
                "hover:bg-muted hover:text-foreground",
              )}
            >
              <XMarkIcon className="size-4" />
            </Button>
          </div>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search shortcuts"
              aria-label="Search shortcuts"
              className={cn(
                "h-10 bg-background pl-8 text-sm text-foreground",
                "placeholder:text-muted-foreground",
              )}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-4 pt-3 pb-5">
            {groupedShortcuts.length > 0 ? (
              <div className="space-y-5">
                {groupedShortcuts.map((section) => (
                  <section key={section.group} className="space-y-2">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      {GROUP_LABELS[section.group] ?? section.group}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((shortcut) => (
                        <div
                          key={shortcut.id}
                          className="flex items-start justify-between gap-4 px-0 py-1"
                        >
                          <div className="min-w-0 text-[13px] font-medium leading-5 text-foreground">
                            {shortcut.title}
                          </div>
                          <ShortcutBindingStack bindings={shortcut.bindings} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
                No shortcuts found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
