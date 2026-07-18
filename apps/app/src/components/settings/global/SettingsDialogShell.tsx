"use client";

import React from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@featul/ui/components/dialog";

type SettingsDialogShellProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  /** "default" matches 450/380, "wide" matches 520/420, "widest" matches 680/800, "xl" matches 900/960, "xxl" matches 1040/1120 */
  width?: "default" | "wide" | "widest" | "xl" | "xxl";
  offsetY?: string | number;
  verticalAnchor?: "center" | "top";
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  dialogClassName?: string;
  panelClassName?: string;
  bodyClassName?: string;
  layoutTransition?: Transition;
  children: React.ReactNode;
};

export function SettingsDialogShell({
  open,
  onOpenChange,
  title,
  description,
  width = "default",
  offsetY = "50%",
  verticalAnchor = "center",
  icon,
  headerActions,
  dialogClassName,
  panelClassName,
  bodyClassName,
  layoutTransition,
  children,
}: SettingsDialogShellProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const styleWidth =
    width === "xxl"
      ? { width: "min(92vw, 1070px)", maxWidth: "none" as const }
      : width === "xl"
        ? { width: "min(92vw, 750px)", maxWidth: "none" as const }
        : width === "widest"
          ? { width: "min(92vw, 650px)", maxWidth: "none" as const }
          : width === "wide"
            ? { width: "min(92vw, 490px)", maxWidth: "none" as const }
            : { width: "min(92vw, 420px)", maxWidth: "none" as const };

  const topValue = typeof offsetY === "number" ? `${offsetY}%` : offsetY;
  const positionStyle: React.CSSProperties & { ["--tw-translate-y"]?: string } =
    {
      top: topValue,
      ["--tw-translate-y"]: verticalAnchor === "top" ? "0px" : `-${topValue}`,
    };
  const shellTransition: Transition =
    layoutTransition ??
    (prefersReducedMotion
      ? { duration: 0 }
      : { type: "spring", stiffness: 280, damping: 28, mass: 0.95 });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fluid
        style={positionStyle}
        className={cn(
          "max-w-none sm:max-w-none p-1 bg-muted rounded-2xl gap-1",
          dialogClassName,
        )}
      >
        <motion.div
          layout
          transition={shellTransition}
          style={styleWidth}
          className={cn("max-w-none origin-top", panelClassName)}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pr-10">
            <DialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-0.5 text-sm font-normal">
              {icon}
              {title}
            </DialogTitle>
            {headerActions ? (
              <div className="flex items-center gap-1 pr-2">
                {headerActions}
              </div>
            ) : null}
          </DialogHeader>
          <div
            className={cn(
              "bg-card rounded-xl p-2 dark:bg-black/60 border border-border",
              bodyClassName,
            )}
          >
            {description ? (
              <DialogDescription className="text-sm mb-2">
                {description}
              </DialogDescription>
            ) : null}
            {children}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
