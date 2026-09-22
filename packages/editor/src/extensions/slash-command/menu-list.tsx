import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { AspectIcon } from "@featul/ui/icons/aspect";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { EditorSlashMenuProps } from "../../types";

/**
 * Menu list component for slash commands
 * Displays available commands in a popover menu
 * Handles keyboard navigation (ArrowUp, ArrowDown, Enter)
 */
export const EditorSlashMenu = ({
  items,
  editor,
  range,
  isLoading,
}: EditorSlashMenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectItem = (index: number) => {
    const item = items.at(index);
    if (item) {
      item.command({ editor, range });
    }
  };

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex];
    if (selectedItem && listRef.current) {
      selectedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Enter":
          event.preventDefault();
          selectItem(selectedIndex);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex]);

  if (isLoading) {
    return null;
  }

  return (
    <Popover open={true}>
      <PopoverAnchor asChild>
        <div
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            top: 0,
            left: 0,
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        id="slash-command"
        unstyled
        side="bottom"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn(
          overlayDialogClass,
          "z-50 flex w-80 flex-col gap-2 text-popover-foreground outline-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        )}
      >
        <div className="flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
          <AspectIcon className="size-3.5 text-primary" />
          Commands
        </div>
        <div className={cn(overlayInnerClass, "p-1")}>
          {items.length === 0 ? (
            <div className="flex w-full items-center justify-center px-3 py-4 text-sm text-accent">
              No results
            </div>
          ) : (
            <PopoverList
              ref={listRef}
              className="flex max-h-[300px] flex-col overflow-y-auto"
            >
              {items.map((item, index) => (
                <PopoverListItem
                  key={item.title}
                  ref={(el: HTMLButtonElement | null) => {
                    itemRefs.current[index] = el;
                  }}
                  className={cn(
                    "gap-2 text-sm",
                    selectedIndex === index && "bg-muted/40",
                  )}
                  onClick={() => selectItem(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  data-selected={selectedIndex === index}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    <item.icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium leading-none">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-accent">
                      {item.description}
                    </span>
                  </div>
                </PopoverListItem>
              ))}
            </PopoverList>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Handle keyboard navigation for slash command menu
 * This function is called from the slash-command extension
 */
export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const slashCommand = document.querySelector<HTMLElement>("#slash-command");

    if (slashCommand) {
      // For Enter key, find and trigger the selected item
      if (event.key === "Enter") {
        const selectedItem = slashCommand.querySelector<HTMLElement>(
          '[data-selected="true"], button[data-slot="popover-list-item"]'
        );

        if (selectedItem) {
          event.preventDefault();
          event.stopPropagation();
          selectedItem.click();
          return true;
        }

        // If no item is selected, select the first item
        const firstItem = slashCommand.querySelector<HTMLElement>(
          'button[data-slot="popover-list-item"]'
        );
        if (firstItem) {
          event.preventDefault();
          event.stopPropagation();
          firstItem.click();
          return true;
        }
      }

      // For ArrowUp/ArrowDown, let the component handle it via useEffect
      // We just need to prevent default and stop propagation
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  }

  return false;
};
