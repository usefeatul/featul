"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { DrawerTrigger } from "@featul/ui/components/drawer";
import type { NavItem } from "../../types/nav";
import MoreIcon from "@featul/ui/icons/more";

function isItemActive(pathname: string, item: NavItem) {
  if (item.external) return false
  const activePrefix = item.match || item.href
  return (
    pathname === activePrefix ||
    (!item.exact && activePrefix !== "/" && pathname.startsWith(activePrefix))
  )
}

const pillTransition = (reduce: boolean | null) =>
  reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

export default function MobileBottomBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname() || ""
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = React.useState<string | null>(null)

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t bg-background">
      <LayoutGroup id="mobile-bottom-nav">
      <div className="grid grid-cols-5">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = isItemActive(pathname, item)
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onMouseEnter={() => setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "group relative flex w-full flex-col items-center justify-center gap-1 px-1 py-2 text-xs sm:text-xs",
                active ? "text-foreground" : "text-accent"
              )}
            >
              {hovered === item.label ? (
                <motion.span
                  layoutId="mobile-bottom-hover-pill"
                  className="absolute inset-1 z-0 rounded-md bg-muted dark:bg-black/40"
                  transition={pillTransition(reduceMotion)}
                />
              ) : null}
              {active ? (
                <motion.span
                  layoutId="mobile-bottom-active-pill"
                  className="absolute inset-1 z-0 rounded-md bg-muted dark:bg-muted/45"
                  transition={pillTransition(reduceMotion)}
                />
              ) : null}
              <Icon
                className={cn(
                  "relative z-[1] size-4 transition-colors duration-200",
                  active
                    ? "text-primary opacity-100"
                    : "text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100"
                )}
              />
              <span className="relative z-[1] truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
        <DrawerTrigger asChild>
          <button
            className="group relative flex w-full flex-col items-center justify-center gap-1 px-1 py-2 text-xs sm:text-xs text-accent"
            onMouseEnter={() => setHovered("more")}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === "more" ? (
              <motion.span
                layoutId="mobile-bottom-hover-pill"
                className="absolute inset-1 z-0 rounded-md bg-muted dark:bg-black/40"
                transition={pillTransition(reduceMotion)}
              />
            ) : null}
            <MoreIcon className="relative z-[1] size-4 text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100 transition-colors duration-200" />
            <span className="relative z-[1] truncate w-full text-center">More</span>
          </button>
        </DrawerTrigger>
      </div>
      </LayoutGroup>
    </div>
  );
}
