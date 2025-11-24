"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import type { NavItem } from "../../types/nav";
import {
  buildTopNav,
  buildMiddleNav,
  buildBottomNav,
  getSlugFromPath,
} from "../../config/nav";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SignOutButton from "@/components/auth/SignOutButton";
import Timezone from "./Timezone";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
const secondaryNav: NavItem[] = buildBottomNav();

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = getSlugFromPath(pathname);

  const primaryNav = buildTopNav(slug);
  const middleNav = buildMiddleNav(slug);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (t && (t as any).isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (key === "r" || key === "c" || key === "b") {
        const target =
          key === "r"
            ? middleNav.find((i) => i.label.toLowerCase() === "roadmap")
            : key === "c"
            ? middleNav.find((i) => i.label.toLowerCase() === "changelog")
            : middleNav.find((i) => i.label.toLowerCase() === "my board");
        if (target) {
          if (target.external) {
            window.open(target.href, "_blank");
          } else {
            router.push(target.href);
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [middleNav, router]);

  return (
    <aside
      className={cn(
        "mt-4 hidden md:flex md:h-screen w-full md:w-60 flex-col bg-background",
        "md:sticky md:top-4",
        className
      )}
    >
      <div className="p-3">
        <div className="group flex items-center gap-2 rounded-md px-2 py-2">
          <img src="/logo.svg" alt="feedback" className="h-6 w-6" />
          <div className="text-sm font-semibold">feedback</div>
        </div>
        <WorkspaceSwitcher className="mt-3" />
        <Timezone className="mt-2" />
      </div>
      <SidebarSection title="REQUEST">
        {primaryNav.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} />
        ))}
      </SidebarSection>

      <SidebarSection title="WORKSPACE" className="mt-4">
        {middleNav.map((item) => {
          const letter = item.label === "Roadmap" ? "R" : item.label === "Changelog" ? "C" : item.label === "My Board" ? "B" : "";
          return (
            <div key={item.label} className="relative">
              <SidebarItem item={item} pathname={pathname} />
              {letter ? (
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-accent">
                  {letter}
                </span>
              ) : null}
            </div>
          );
        })}
      </SidebarSection>

      <SidebarSection className="mt-auto pb-8">
        {secondaryNav.map((item) => (
          <SidebarItem key={item.label} item={item} pathname={pathname} />
        ))}
        <SignOutButton />
      </SidebarSection>
    </aside>
  );
}
