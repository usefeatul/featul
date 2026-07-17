import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { MentionSuggestionItem } from "../../types";

export type EditorMentionMenuProps = {
  items: MentionSuggestionItem[];
  command: (item: MentionSuggestionItem) => void;
  isLoading?: boolean;
};

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("") || "@";

/**
 * Mention suggestion menu shown when typing '@' in the editor.
 */
export const EditorMentionMenu = ({
  items,
  command,
  isLoading,
}: EditorMentionMenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectItem = (index: number) => {
    const item = items.at(index);
    if (item) {
      command(item);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex];
    if (selectedItem && listRef.current) {
      selectedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

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
        id="mention-command"
        className="p-1 bg-muted dark:bg-black/40 rounded-2xl gap-1 w-72 shadow-none border-none"
        list={true}
        side="bottom"
        align="start"
        sideOffset={10}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg flex w-full items-center justify-center p-4 text-muted-foreground text-sm">
            <p>No people found</p>
          </div>
        ) : (
          <PopoverList
            ref={listRef}
            className="bg-card border border-border rounded-lg p-2 flex flex-col gap-1 max-h-[260px] overflow-y-auto"
          >
            {items.map((item, index) => (
              <PopoverListItem
                key={item.id}
                ref={(el: HTMLButtonElement | null) => {
                  itemRefs.current[index] = el;
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-muted/50 data-[selected=true]:bg-muted/50"
                onClick={() => selectItem(index)}
                onMouseDown={(event: MouseEvent<HTMLButtonElement>) =>
                  event.preventDefault()
                }
                onMouseEnter={() => setSelectedIndex(index)}
                data-selected={selectedIndex === index}
                style={{
                  backgroundColor:
                    selectedIndex === index ? "var(--muted)" : "transparent",
                }}
              >
                <Avatar className="size-7">
                  <AvatarImage src={item.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-[11px]">
                    {getInitials(item.label)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="font-medium text-sm truncate block">
                    {item.label}
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
 * Handles mention menu keyboard routing from suggestion lifecycle hooks.
 */
export const handleMentionNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const mentionCommand = document.querySelector<HTMLElement>("#mention-command");

    if (mentionCommand) {
      if (event.key === "Enter") {
        const selectedItem = mentionCommand.querySelector<HTMLElement>(
          '[data-selected="true"], button[data-slot="popover-list-item"]',
        );

        if (selectedItem) {
          event.preventDefault();
          event.stopPropagation();
          selectedItem.click();
          return true;
        }

        const firstItem = mentionCommand.querySelector<HTMLElement>(
          'button[data-slot="popover-list-item"]',
        );

        if (firstItem) {
          event.preventDefault();
          event.stopPropagation();
          firstItem.click();
          return true;
        }
      }

      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  }

  return false;
};
