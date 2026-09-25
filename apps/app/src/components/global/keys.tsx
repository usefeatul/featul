"use client";

import { type ReactNode, useEffect, useState } from "react";
import { ArrowBigUp } from "@/components/global/icons";

const keyClassName =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] bg-white/25 px-1 text-[10px] font-medium leading-none text-white dark:bg-black/[0.14] dark:text-zinc-700";

export function ShortcutKey({ children }: { children: ReactNode }) {
  return <kbd className={keyClassName}>{children}</kbd>;
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
