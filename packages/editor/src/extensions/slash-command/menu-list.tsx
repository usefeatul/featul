import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
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
        className="w-64 p-0 shadow-lg"
        list={true}
        side="bottom"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {items.length === 0 ? (
          <div className="flex w-full items-center justify-center p-4 text-muted-foreground text-sm">
            <p>No results</p>
          </div>
        ) : (
          <PopoverList ref={listRef}>
            {items.map((item, index) => (
              <PopoverListItem
                key={item.title}
                ref={(el: HTMLButtonElement | null) => {
                  itemRefs.current[index] = el;
                }}
                className="flex items-center gap-2 px-2 py-1.5"
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  backgroundColor:
                    selectedIndex === index
                      ? "var(--muted)"
                      : "transparent",
                }}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded border bg-secondary">
                  <item.icon className="text-muted-foreground size-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.title}</span>
                  <span className="text-accent text-xs">
                    {item.description}
                  </span>
                </div>
              </PopoverListItem>
            ))}
          </PopoverList>
        )}
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
