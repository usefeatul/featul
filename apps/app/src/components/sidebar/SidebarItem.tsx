"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import { SidebarBadge } from "./badge";

const pillTransition = (reduce: boolean | null) =>
  reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

function SidebarItem({
  item,
  pathname,
  className = "",
  shortcut,
  count,
  mutedIcon = false,
  onClick,
  indicator = true,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
  shortcut?: string;
  count?: number;
  mutedIcon?: boolean;
  onClick?: () => void;
  indicator?: boolean;
}) {
  const Icon = item.icon;
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
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
    "group relative flex items-center gap-2 rounded-md px-3 py-2 text-xs md:text-sm",
    active ? "text-foreground" : "text-accent",
    className
  );
  const content = (
    <>
      {hovered ? (
        <motion.span
          layoutId="sidebar-hover-pill"
          className="absolute inset-0 z-0 rounded-md bg-muted dark:bg-black/40"
          transition={pillTransition(reduceMotion)}
        />
      ) : null}
      {indicator && active ? (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 z-0 rounded-md bg-muted dark:bg-muted/50"
          transition={pillTransition(reduceMotion)}
        />
      ) : null}
      <Icon
        className={cn(
          "relative z-[1] size-5 transition-colors duration-200",
          active
            ? "text-primary opacity-100"
            : "text-foreground group-hover:text-primary",
          !active && mutedIcon ? "opacity-60 group-hover:opacity-100" : ""
        )}
      />
      <span className="relative z-[1] transition-colors duration-200">{item.label}</span>
      {typeof count === "number" && count > 0 ? (
        <SidebarBadge className="relative z-[1] ml-auto" fixedWidth={count < 10}>
          {count}
        </SidebarBadge>
      ) : shortcut ? (
        <SidebarBadge className="relative z-[1] ml-auto">
          {shortcut}
        </SidebarBadge>
      ) : null}
    </>
  );

  const hoverProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-current={active ? "page" : undefined}
        onClick={onClick}
        {...hoverProps}
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
      {...hoverProps}
    >
      {content}
    </Link>
  );
}
export default React.memo(SidebarItem);
