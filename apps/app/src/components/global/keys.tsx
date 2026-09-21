"use client";

import { useEffect, useState } from "react";

const keyClassName =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] bg-white/15 px-1 text-[10px] font-medium leading-none text-white/80 dark:bg-black/[0.07] dark:text-zinc-500";

export function PanelShortcutKeys() {
  const [modifier, setModifier] = useState("⌘");

  useEffect(() => {
    if (!/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setModifier("Ctrl");
    }
  }, []);

  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1">
      <kbd className={keyClassName}>{modifier}</kbd>
      <kbd className={keyClassName}>\</kbd>
    </span>
  );
}
