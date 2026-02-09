"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { docsSections } from "../../config/docsNav";
import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";

// Flatten all nav items for tracking
const allNavItems = docsSections.flatMap((section) => section.items);

export function DocsSidebar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });

  // Calculate indicator position based on active item
  const updateIndicator = () => {
    const activeItem = allNavItems.find((item) => item.href === pathname);
    if (!activeItem || !navRef.current) return;

    const activeEl = itemRefs.current.get(activeItem.href);
    if (!activeEl) return;

    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    setIndicatorStyle({
      top: itemRect.top - navRect.top,
      height: itemRect.height,
      opacity: 1,
    });
  };

  // Update on pathname change and initial mount
  useLayoutEffect(() => {
    updateIndicator();
  }, [pathname]);

  // Handle resize
  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, []);

  return (
    <nav className="flex flex-col h-full select-none">
      {/* Logo header - clean and simple */}
      <Link
        href="/"
        className="group flex items-center gap-3 mb-12"
      >
        <FeatulLogoIcon className="size-5 text-foreground" />
        <span className="text-sm bg-card border border-border rounded-md px-2 py-0.5 font-medium text-foreground">
          Docs
        </span>
      </Link>

      {/* Navigation sections with gliding indicator */}
      <div ref={navRef} className="flex-1 space-y-8 relative">
        {/* Gliding active indicator */}
        <motion.div
          className="absolute left-0 w-0.5 bg-primary rounded-full"
          initial={false}
          animate={{
            top: indicatorStyle.top,
            height: indicatorStyle.height,
            opacity: indicatorStyle.opacity,
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            mass: 1,
          }}
        />

        {docsSections.map((section) => (
          <div key={section.label}>
            {/* Section label */}
            <p className="text-xs font-semibold text-foreground tracking-[0.1em] uppercase mb-3 pl-3">
              {section.label}
            </p>

            {/* Section items */}
            <ul className="space-y-0.5 border-l border-border/50">
              {section.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      ref={(el) => {
                        if (el) itemRefs.current.set(item.href, el);
                      }}
                      href={item.href}
                      className={cn(
                        "group relative block py-1.5 pl-3 -ml-px text-sm transition-colors duration-150",
                        isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/60 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
