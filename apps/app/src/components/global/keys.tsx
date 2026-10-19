"use client";

import { type ReactNode, useEffect, useState } from "react";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { ArrowBigUp } from "@/components/global/icons";

// Keycap: raised surface plus a darker bottom lip.
const keyClassName = cn(
  raisedSurfaceClass,
  "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-medium leading-none text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.35),0_1px_1px_rgba(0,0,0,0.3)]",
);

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
