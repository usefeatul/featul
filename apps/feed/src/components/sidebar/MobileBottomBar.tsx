"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@feedgot/ui/lib/utils";
import { DrawerTrigger } from "@feedgot/ui/components/drawer";
import type { NavItem } from "../../types/nav";
import MoreIcon from "@feedgot/ui/icons/more";

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
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs text-accent hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-[18px] h-[18px] text-foreground/80" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <DrawerTrigger asChild>
          <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs text-accent hover:text-foreground hover:bg-muted">
            <MoreIcon className="w-[18px] h-[18px] text-foreground/80" />
            <span>More</span>
          </button>
        </DrawerTrigger>
      </div>
    </div>
  );
}

