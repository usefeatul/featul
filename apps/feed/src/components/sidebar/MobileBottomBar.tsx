"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@oreilla/ui/lib/utils";
import { DrawerTrigger } from "@oreilla/ui/components/drawer";
import type { NavItem } from "../../types/nav";
import MoreIcon from "@oreilla/ui/icons/more";

export default function MobileBottomBar({ items }: { items: NavItem[] }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t bg-background">
      <div className="grid grid-cols-5">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 px-3 py-2 text-[10px] sm:text-xs text-accent hover:bg-muted"
              )}
            >
              <Icon className="w-[18px] h-[18px] text-foreground opacity-60 hover:text-primary hover:opacity-100 transition-colors" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <DrawerTrigger asChild>
          <button className="group flex flex-col items-center justify-center gap-1 px-3 py-2 text-[10px] sm:text-xs text-accent hover:bg-muted">
            <MoreIcon className="w-[18px] h-[18px] text-foreground opacity-60 hover:text-primary hover:opacity-100 transition-colors" />
            <span>More</span>
          </button>
        </DrawerTrigger>
      </div>
    </div>
  );
}
