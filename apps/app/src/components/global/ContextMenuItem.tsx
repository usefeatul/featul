"use client";

import { PopoverListItem } from "@featul/ui/components/popover";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";

export const CONTEXT_MENU_DESTRUCTIVE_CLASS =
  "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10";

function ContextMenuIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center">
      {children}
    </span>
  );
}

type ContextMenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
};

export function ContextMenuItem({
  icon,
  label,
  onClick,
  className,
}: ContextMenuItemProps) {
  return (
    <PopoverListItem onClick={onClick} className={className}>
      <ContextMenuIcon>{icon}</ContextMenuIcon>
      <span className="text-sm">{label}</span>
    </PopoverListItem>
  );
}

export function ContextMenuSubmenuItem({
  icon,
  label,
  onClick,
}: ContextMenuItemProps) {
  return (
    <PopoverListItem onClick={onClick}>
      <ContextMenuIcon>{icon}</ContextMenuIcon>
      <span className="text-sm">{label}</span>
      <ChevronRightIcon className="ml-auto size-3.5 text-muted-foreground" />
    </PopoverListItem>
  );
}

export function ContextMenuCheckSlot({
  checked,
  children,
}: {
  checked: boolean;
  children?: React.ReactNode;
}) {
  return (
    <ContextMenuIcon>{checked ? children : null}</ContextMenuIcon>
  );
}
