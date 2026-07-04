"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";

function SidebarItem({
  item,
  pathname,
  className = "",
  shortcut,
  count,
  mutedIcon = false,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
  shortcut?: string;
  count?: number;
  mutedIcon?: boolean;
  onClick?: () => void;
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
    "group grid h-10 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-md px-3 text-sm",
    active
      ? "bg-muted/70 text-foreground"
      : "text-accent hover:bg-muted/60 hover:text-foreground",
    className
  );
  const content = (
    <>
      <Icon
        className={cn(
          "size-5.5 justify-self-center text-foreground transition-colors group-hover:text-primary",
          mutedIcon ? "opacity-60 group-hover:opacity-100" : ""
        )}
      />
      <span className="min-w-0 truncate transition-colors">{item.label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="ml-auto inline-flex h-5 min-w-6 items-center justify-center rounded-sm border border-border/90 bg-card px-1.5 text-center text-[11px] font-semibold leading-none text-accent/80 tabular-nums transition-colors group-hover:border-border dark:border-border/60 dark:group-hover:border-border/80 group-hover:text-accent">
          {count}
        </span>
      ) : shortcut ? (
        <span className="ml-auto inline-flex h-5 min-w-6 items-center justify-center rounded-sm border border-border/90 bg-card px-1.5 text-center text-[11px] font-semibold leading-none text-accent/80 transition-colors group-hover:border-border dark:border-border/60 dark:group-hover:border-border/80 group-hover:text-accent">
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
        onClick={onClick}
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
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
export default React.memo(SidebarItem);
