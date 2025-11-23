"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import type { NavItem } from "./types";
import {
  buildTopNav,
  buildMiddleNav,
  buildBottomNav,
  getSlugFromPath,
} from "./nav";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SignOutButton from "@/components/auth/SignOutButton";
const secondaryNav: NavItem[] = buildBottomNav();

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const slug = getSlugFromPath(pathname);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          "group flex items-center gap-2 rounded-md px-3 py-2 text-sm",
          active ? "bg-card text-foreground" : "text-accent hover:bg-muted"
        )}
      >
        <Icon className="w-[18px] h-[18px] text-foreground/80 group-hover:text-primary transition-colors" />
        <span className="transition-colors">{item.label}</span>
      </Link>
    );
  };

  const primaryNav = buildTopNav(slug);
  const middleNav = buildMiddleNav(slug);
  return (
    <aside
      className={cn(
        "mt-4 flex md:h-screen h-auto w-full md:w-60 flex-col bg-background",
        "md:sticky md:top-4",
        className
      )}
    >
      <div className="p-3">
        <div className="group flex items-center gap-2 rounded-md px-3 py-2">
          <img src="/logo.svg" alt="feedback" className="h-6 w-6" />
          <div className="text-sm font-semibold">feedback</div>
        </div>
        <WorkspaceSwitcher className="mt-3" />
      </div>
      <nav className="p-3 space-y-1">{primaryNav.map(renderItem)}</nav>

      <div className="p-3 mt-4">
        <div className="space-y-1">{middleNav.map(renderItem)}</div>
      </div>

      <div className="mt-auto p-3 pb-8 space-y-1">
        {secondaryNav.map(renderItem)}
        <SignOutButton />
      </div>
    </aside>
  );
}
