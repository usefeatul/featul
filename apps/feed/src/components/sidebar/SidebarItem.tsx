"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@oreilla/ui/lib/utils";
import type { NavItem } from "../../types/nav";

function SidebarItem({
  item,
  pathname,
  className = "",
  shortcut,
  count,
  mutedIcon = false,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
  shortcut?: string;
  count?: number;
  mutedIcon?: boolean;
}) {
  const Icon = item.icon;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const active =
    mounted &&
    !item.external &&
    (pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href)));
  const classes = cn(
    "group flex items-center gap-2 rounded-md  px-3 py-2 text-xs md:text-sm",
    active ? "bg-card text-foreground" : "text-accent hover:bg-muted dark:hover:bg-black/40",
    className
  );
  const content = (
    <>
      <Icon
        className={cn(
          "size-5 text-foreground group-hover:text-primary transition-colors",
          mutedIcon ? "opacity-60 group-hover:opacity-100" : ""
        )}
      />
      <span className="transition-colors">{item.label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="ml-auto rounded-sm bg-card px-1.5 py-0.5 text-xs font-extralight text-accent/10 tabular-nums border border-border shadow-xs">
          {count}
        </span>
      ) : shortcut ? (
        <span className="ml-auto rounded-sm bg-card px-1.5 py-0.5 text-xs font-extralight text-accent/10  border border-border shadow-xs">
          {shortcut}
        </span>
      ) : null}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={classes}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}
export default React.memo(SidebarItem);
