"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@featul/ui/components/tooltip";
import { cn } from "@featul/ui/lib/utils";
import { PanelShortcutKeys } from "@/components/global/keys";
import { SIDEBAR_ARIA_SHORTCUTS } from "@/hooks/shortcut";
import { SidebarPanelIcon } from "@/components/global/icons";
import { sidebarHeaderActionClassName } from "./styles";

export default function SidebarToggle({
  collapsed,
  onToggle,
  className,
}: {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          aria-label={label}
          aria-expanded={!collapsed}
          aria-controls="workspace-navigation"
          aria-keyshortcuts={SIDEBAR_ARIA_SHORTCUTS}
          className={cn(sidebarHeaderActionClassName, "cursor-pointer", className)}
        >
          <SidebarPanelIcon className="size-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={collapsed ? "right" : "bottom"}
        className="flex items-center gap-2"
      >
        {label}
        <PanelShortcutKeys shift />
      </TooltipContent>
    </Tooltip>
  );
}
