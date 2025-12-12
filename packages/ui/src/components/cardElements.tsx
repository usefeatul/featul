import type { ReactNode } from "react";
import { cn } from "@oreilla/ui/lib/utils"; 

export const CardAccent = ({ children }: { children: ReactNode }) => (
  <p className="text-accent mt-1 text-sm sm:text-base">{children}</p>
);

export const CardTag = ({ children = "no setup required" }: { children?: ReactNode }) => (
  <span className="absolute right-3 top-3 text-accent text-xs border border-border bg-muted backdrop-blur-sm rounded-md px-2 py-0.5">
    {children}
  </span>
);

export const AccentBar = ({ width = 10, height, className }: { width?: number; height?: number | string; className?: string }) => (
  <div
    aria-hidden
    className={cn(height == null ? "self-stretch" : "", "rounded-md bg-primary ring-2 ring-inset ring-primary", className)}
    style={{ width, ...(height != null ? { height } : {}) }}
  />
);