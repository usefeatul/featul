"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import { SidebarBadge } from "./badge";
import { sidebarLeadSlotClassName, sidebarRowClassName } from "./styles";

const pillTransition = (reduce: boolean | null) =>
  reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

function SidebarItem({
  item,
  pathname,
  className = "",
  count,
  mutedIcon = false,
  onClick,
  indicator = true,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
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
    sidebarRowClassName,
    "text-foreground",
    className
  );
  const content = (
    <>
      {hovered ? (
        <motion.span
          layoutId="sidebar-hover-pill"
          className="absolute inset-0 z-0 rounded-md bg-sidebar-accent/70"
          transition={pillTransition(reduceMotion)}
        />
      ) : null}
      {indicator && active ? (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 z-0 rounded-md bg-sidebar-accent"
          transition={pillTransition(reduceMotion)}
        />
      ) : null}
      <span className={sidebarLeadSlotClassName}>
        <Icon
          className={cn(
            "size-5 transition-colors duration-200",
            active
              ? "text-primary opacity-100"
              : mutedIcon
                ? "text-neutral-400 opacity-100 group-hover:text-primary dark:text-neutral-300 dark:group-hover:text-primary"
                : "text-foreground group-hover:text-primary"
          )}
        />
      </span>
      <span className="relative z-[1] min-w-0 flex-1 truncate transition-colors duration-200">{item.label}</span>
      {typeof count === "number" && count > 0 ? (
        <SidebarBadge className="relative z-[1] ml-auto shrink-0" innerClassName="font-medium text-muted-foreground/70" fixedWidth={count < 10}>
          {count}
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
