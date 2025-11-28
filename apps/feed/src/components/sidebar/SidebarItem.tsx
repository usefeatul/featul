"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@feedgot/ui/lib/utils";
import type { NavItem } from "../../types/nav";

function SidebarItem({
  item,
  pathname,
  className = "",
  shortcut,
  count,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
  shortcut?: string;
  count?: number;
}) {
  const Icon = item.icon;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const active = mounted && !item.external && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
  const classes = cn(
    "group flex items-center gap-2 rounded-md px-3 py-2 text-xs md:text-sm",
    active ? "bg-card text-foreground" : "text-accent hover:bg-muted",
    className
  );
  const content = (
    <>
      <Icon className="w-[18px] h-[18px] text-foreground/80 group-hover:text-primary transition-colors" />
      <span className="transition-colors">{item.label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-accent tabular-nums">{count}</span>
      ) : shortcut ? (
        <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-accent">{shortcut}</span>
      ) : null}
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={classes} aria-current={active ? "page" : undefined}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={classes} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  );
}
export default React.memo(SidebarItem)
