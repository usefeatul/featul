"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import { SheetTrigger } from "@featul/ui/components/sheet";
import type { NavItem } from "../../types/nav";
import MoreIcon from "@featul/ui/icons/more";

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
                "group flex w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] sm:text-xs text-accent hover:bg-muted dark:hover:bg-black/40"
              )}
            >
              <Icon className="size-4 text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100 transition-colors" />
              <span className="truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
        <SheetTrigger asChild>
          <button className="group flex w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] sm:text-xs text-accent hover:bg-muted dark:hover:bg-black/40">
            <MoreIcon className="size-4 text-foreground opacity-60 group-hover:text-primary group-hover:opacity-100 transition-colors" />
            <span className="truncate w-full text-center">More</span>
          </button>
        </SheetTrigger>
      </div>
    </div>
  );
}
