"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "@featul/ui/icons/chevron-down";
import { SearchIcon } from "@featul/ui/icons/search";
import { cn } from "@featul/ui/lib/utils";
import { X } from "lucide-react";
import { docsSections } from "../../config/docsNav";

const docsNavSectionClass =
  "flex w-full cursor-pointer items-center py-1.5 text-left text-xs font-medium uppercase tracking-[0.08em] transition-colors";

const docsNavSubitemClass =
  "flex w-full cursor-pointer items-center py-1.5 pl-3 text-left text-sm leading-5 transition-colors";

export function DocsSidebar() {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const activeSection = docsSections.find((section) =>
    section.items.some((item) => item.href === pathname),
  )?.label;

  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    if (pathname === "/docs") {
      return new Set(docsSections.map((section) => section.label));
    }
    return new Set(activeSection ? [activeSection] : []);
  });

  useEffect(() => {
    if (pathname === "/docs") {
      setOpenSections(new Set(docsSections.map((section) => section.label)));
      return;
    }
    if (activeSection) {
      setOpenSections((current) => {
        if (current.has(activeSection)) return current;
        const next = new Set(current);
        next.add(activeSection);
        return next;
      });
    }
  }, [pathname, activeSection]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docsSections;
    return docsSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            section.label.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  const searching = query.trim().length > 0;

  function toggleSection(label: string) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <nav aria-label="Documentation" className="flex flex-col">
      <label className="relative mb-6 block">
        <span className="sr-only">Search docs</span>
        <SearchIcon
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-accent"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search docs"
          autoComplete="off"
          className={cn(
            "h-8 w-full appearance-none rounded-md border border-border bg-background pl-8 text-sm text-foreground shadow-none outline-none placeholder:text-foreground/40",
            "focus:bg-background focus:shadow-none focus-visible:border-border focus-visible:bg-background focus-visible:ring-0",
            "autofill:bg-background autofill:shadow-[inset_0_0_0_1000px_var(--background)]",
            "[&:-webkit-autofill]:bg-background [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--background)] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit]",
            searching ? "pr-8" : "pr-3",
          )}
        />
        {searching ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute top-1/2 left-auto flex -translate-y-1/2 cursor-pointer items-center justify-center text-primary hover:text-primary/80"
            style={{ right: 8 }}
          >
            <X className="size-3.5 text-primary" strokeWidth={2} />
          </button>
        ) : null}
      </label>

      <div className="space-y-1">
        {!searching ? (
          <Link
            href="/docs"
            className={cn(
              docsNavSectionClass,
              pathname === "/docs"
                ? "text-foreground"
                : "text-foreground/45 hover:text-foreground",
            )}
          >
            Overview
          </Link>
        ) : null}
        {filteredSections.map((section) => {
          const isOpen = searching || openSections.has(section.label);
          return (
            <div key={section.label}>
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className={cn(
                  docsNavSectionClass,
                  "justify-between gap-2 text-foreground/45 hover:text-foreground",
                )}
                aria-expanded={isOpen}
              >
                {section.label}
                <ChevronDownIcon
                  className={cn(
                    "size-3 shrink-0 transition-transform duration-200",
                    !isOpen && "-rotate-90",
                  )}
                />
              </button>
              {isOpen ? (
                <div className="mb-3 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          docsNavSubitemClass,
                          isActive
                            ? "font-medium text-foreground"
                            : "text-foreground/70 hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
        {filteredSections.length === 0 ? (
          <p className="py-3 text-sm text-accent">No matching pages.</p>
        ) : null}
      </div>
    </nav>
  );
}
