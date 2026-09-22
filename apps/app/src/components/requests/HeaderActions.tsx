"use client";

import FiltersAction from "./actions/FiltersAction";
import { cn } from "@featul/ui/lib/utils";

export default function HeaderActions({ className }: { className?: string }) {
  return (
    <div className={cn("ml-auto flex shrink-0 items-center", className)}>
      <FiltersAction className="size-8 rounded-md border-0 bg-black/5 p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.08] hover:text-foreground dark:bg-[#292929] dark:hover:bg-[#303030]" />
    </div>
  );
}
