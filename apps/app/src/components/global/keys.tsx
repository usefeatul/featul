"use client";

import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@featul/ui/lib/utils";
import { ArrowBigUp } from "@/components/global/icons";

const keyClassName =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-border/60 bg-muted px-1 text-[10px] font-medium leading-none text-muted-foreground dark:border-white/10 dark:bg-white/[0.06]";

export function ShortcutKey({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cn(keyClassName, className)}>{children}</kbd>;
}

export function PanelShortcutKeys({ shift = false }: { shift?: boolean }) {
  const [modifier, setModifier] = useState("⌘");

  useEffect(() => {
    if (!/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setModifier("Ctrl");
    }
  }, []);

  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1">
      <ShortcutKey>
        <span className={modifier === "⌘" ? "text-sm leading-none" : undefined}>
          {modifier}
        </span>
      </ShortcutKey>
      {shift ? (
        <ShortcutKey>
          <ArrowBigUp className="size-3 fill-current" />
        </ShortcutKey>
      ) : null}
      <ShortcutKey>\</ShortcutKey>
    </span>
  );
}
