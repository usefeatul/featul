"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import { sidebarBadgeClassName } from "./badge";

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
  const activePrefix = item.match || item.href
  const active =
    mounted &&
    !item.external &&
    (pathname === activePrefix ||
      (!item.exact && activePrefix !== "/" && pathname.startsWith(activePrefix)));
  const classes = cn(
    "group flex items-center gap-2 rounded-md  px-3 py-2 text-xs md:text-sm",
    active ? "bg-transparent text-foreground" : "text-accent hover:bg-muted dark:hover:bg-black/40",
    className
  );
  const content = (
    <>
      <Icon
        className={cn(
          "size-5 transition-colors",
          active
            ? "text-primary opacity-100"
            : "text-foreground group-hover:text-primary",
          !active && mutedIcon ? "opacity-60 group-hover:opacity-100" : ""
        )}
      />
      <span className="transition-colors">{item.label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className={cn("ml-auto", sidebarBadgeClassName(count < 10))}>
          {count}
        </span>
      ) : shortcut ? (
        <span className={cn("ml-auto", sidebarBadgeClassName(true))}>
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
      replace={item.replace}
      className={classes}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
export default React.memo(SidebarItem);
