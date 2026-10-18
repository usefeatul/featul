"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip";
import type { NavItem } from "../../types/nav";
import { PinIcon } from "@/components/global/icons";
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
  collapsed = false,
  pinned = false,
  onTogglePin,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
  count?: number;
  mutedIcon?: boolean;
  onClick?: () => void;
  indicator?: boolean;
  collapsed?: boolean;
  pinned?: boolean;
  onTogglePin?: (label: string) => void;
}) {
  const Icon = item.icon;
  const router = useRouter();
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
    collapsed &&
      "mx-auto size-9 w-9 flex-none justify-center gap-0 px-0 py-0",
    className
  );
  const pinnable = !!onTogglePin && !collapsed;
  const content = (
    <>
      {hovered && !(collapsed && active) ? (
        <motion.span
          layoutId="sidebar-hover-pill"
          className="absolute inset-0 z-0 rounded-lg bg-sidebar-accent/70"
          transition={pillTransition(reduceMotion)}
        />
      ) : null}
      {indicator && active && !collapsed ? (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 z-0 rounded-lg bg-sidebar-accent dark:bg-white/[0.07]"
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
                ? "text-neutral-600 opacity-100 group-hover:text-primary dark:text-neutral-300 dark:group-hover:text-primary"
                : "text-foreground group-hover:text-primary"
          )}
        />
      </span>
      {!collapsed ? (
        <span className="relative z-[1] min-w-0 flex-1 truncate transition-colors duration-200">
          {item.label}
        </span>
      ) : null}
      {!collapsed && typeof count === "number" && count > 0 ? (
        <SidebarBadge className={cn("relative z-[1] ml-auto shrink-0", pinnable && "transition-opacity group-hover/pin:opacity-0 group-focus-within/pin:opacity-0")} innerClassName="font-medium text-muted-foreground/70" fixedWidth={count < 10}>
          {count}
        </SidebarBadge>
      ) : null}
    </>
  );

  const hoverProps = {
    onMouseEnter: () => {
      setHovered(true);
      if (!item.external) router.prefetch(item.href);
    },
    onMouseLeave: () => setHovered(false),
  };

  const link = item.external ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onClick}
      {...(!collapsed ? hoverProps : {})}
    >
      {content}
    </a>
  ) : (
    <Link
      href={item.href}
      prefetch={item.label === "Settings" || item.label === "Back" ? true : undefined}
      onFocus={() => router.prefetch(item.href)}
      replace={item.replace}
      className={classes}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onClick}
      {...(!collapsed ? hoverProps : {})}
    >
      {content}
    </Link>
  );

  if (pinnable) {
    const pinLabel = `${pinned ? "Unpin" : "Pin"} ${item.label}`;
    return (
      <div className="group/pin relative">
        {link}
        <button
          type="button"
          aria-label={pinLabel}
          aria-pressed={pinned}
          title={pinLabel}
          onClick={() => onTogglePin(item.label)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="absolute right-1 top-1/2 z-[2] flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/pin:opacity-100"
        >
          <PinIcon aria-hidden className={cn("size-3.5", pinned ? "text-primary" : "text-muted-foreground hover:text-primary")} />
        </button>
      </div>
    );
  }

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild {...hoverProps}>
        {link}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
export default React.memo(SidebarItem);
