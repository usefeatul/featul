"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@featul/ui/icons/search";
import { cn } from "@featul/ui/lib/utils";
import { docsSections } from "../../config/docsNav";

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
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search docs"
          className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </label>

      <div className="space-y-1">
        {!searching ? (
          <Link
            href="/docs"
            className={cn(
              "flex w-full items-center py-1.5 text-left text-xs font-medium uppercase tracking-[0.08em] transition-colors",
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
                className="flex w-full items-center py-1.5 text-left text-xs font-medium uppercase tracking-[0.08em] text-foreground/45 hover:text-foreground"
                aria-expanded={isOpen}
              >
                {section.label}
              </button>
              {isOpen ? (
                <ul className="mb-3 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-md py-1.5 text-sm leading-5 transition-colors",
                            isActive
                              ? "bg-muted font-medium text-foreground"
                              : "text-foreground/70 hover:text-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
        {filteredSections.length === 0 ? (
          <p className="px-2 py-3 text-sm text-accent">No matching pages.</p>
        ) : null}
      </div>
    </nav>
  );
}
