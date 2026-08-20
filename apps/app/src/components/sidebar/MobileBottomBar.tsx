"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function MobileBottomBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname() || ""
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t bg-background">
      <div className="grid grid-cols-5">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = isItemActive(pathname, item)
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex w-full flex-col items-center justify-center gap-1 px-1 py-2 text-xs sm:text-xs hover:bg-muted dark:hover:bg-black/40",
                active ? "text-foreground" : "text-accent"
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors",
                  active
                    ? "text-primary opacity-100"
                    : "text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100"
                )}
              />
              <span className="truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
        <DrawerTrigger asChild>
          <button className="group flex w-full flex-col items-center justify-center gap-1 px-1 py-2 text-xs sm:text-xs text-accent hover:bg-muted dark:hover:bg-black/40">
            <MoreIcon className="size-4 text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100 transition-colors" />
            <span className="truncate w-full text-center">More</span>
          </button>
        </DrawerTrigger>
      </div>
    </div>
  );
}
