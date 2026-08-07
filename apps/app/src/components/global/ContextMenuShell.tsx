"use client";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@featul/ui/components/popover";

type ContextMenuShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number } | null;
  className?: string;
  onContextMenu: (event: React.MouseEvent) => void;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
  menu: React.ReactNode;
};

export function ContextMenuShell({
  open,
  onOpenChange,
  position,
  className,
  onContextMenu,
  onClick,
  children,
  menu,
}: ContextMenuShellProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed size-0"
          style={{
            left: position?.x ?? -9999,
            top: position?.y ?? -9999,
          }}
        />
      </PopoverAnchor>

      <div onContextMenu={onContextMenu} className={className} onClick={onClick}>
        {children}
      </div>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="fit"
        list
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {menu}
      </PopoverContent>
    </Popover>
  );
}
