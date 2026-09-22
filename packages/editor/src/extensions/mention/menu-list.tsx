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
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { AtSign } from "lucide-react";
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
        unstyled
        side="bottom"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          overlayDialogClass,
          "z-50 flex w-max min-w-40 max-w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 text-popover-foreground outline-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        )}
      >
        <div className="flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
          <AtSign className="size-3.5 text-primary" />
          Mention
        </div>
        <div className={cn(overlayInnerClass, "p-1")}>
          {items.length === 0 ? (
            <div className="flex w-full items-center justify-center px-3 py-4 text-sm text-accent">
              No people found
            </div>
          ) : (
            <PopoverList
              ref={listRef}
              className="flex max-h-[260px] flex-col overflow-y-auto"
            >
              {items.map((item, index) => (
                <PopoverListItem
                  key={item.id}
                  ref={(el: HTMLButtonElement | null) => {
                    itemRefs.current[index] = el;
                  }}
                  className={cn(
                    "gap-2 text-sm",
                    selectedIndex === index && "bg-muted/40",
                  )}
                  onClick={() => selectItem(index)}
                  onMouseDown={(event: MouseEvent<HTMLButtonElement>) =>
                    event.preventDefault()
                  }
                  onMouseEnter={() => setSelectedIndex(index)}
                  data-selected={selectedIndex === index}
                >
                  <Avatar className="size-7 rounded-md">
                    <AvatarImage src={item.avatarUrl ?? undefined} />
                    <AvatarFallback className="rounded-md text-[11px]">
                      {getInitials(item.label)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="block whitespace-nowrap font-medium leading-none">
                      {item.label}
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
