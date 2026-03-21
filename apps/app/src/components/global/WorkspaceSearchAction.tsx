"use client";

import React from "react";
import { SearchIcon } from "@featul/ui/icons/search";
import { Button } from "@featul/ui/components/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@featul/ui/components/command";
import { useQuery } from "@tanstack/react-query";
import { client } from "@featul/api/client";

export type WorkspaceSearchResult = {
  id: string;
  title: string;
  slug: string;
};

type WorkspaceSearchActionProps = {
  workspaceSlug: string;
  currentSearch: string;
  className?: string;
  buttonVariant: "card" | "nav";
  showNoResults?: boolean;
  onSearchSubmit: (value: string) => void;
  onResultSelect: (result: WorkspaceSearchResult) => void;
  onClearSearch?: () => void;
};

export function WorkspaceSearchAction({
  workspaceSlug,
  currentSearch,
  className = "",
  buttonVariant,
  showNoResults = false,
  onSearchSubmit,
  onResultSelect,
  onClearSearch,
}: WorkspaceSearchActionProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(currentSearch);

  React.useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", workspaceSlug, value],
    enabled: open && value.trim().length >= 2,
    queryFn: async () => {
      const res = await client.board.searchPostsByWorkspaceSlug.$get({
        slug: workspaceSlug,
        q: value.trim(),
      });
      const data = await res.json();
      return (data?.posts || []) as WorkspaceSearchResult[];
    },
    staleTime: 10_000,
  });

  const hasQuery = value.trim().length >= 2;

  const handleSubmit = () => {
    setOpen(false);
    onSearchSubmit(value);
  };

  const handleClear = () => {
    setValue("");
    setOpen(false);
    onClearSearch?.();
  };

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size="icon-sm"
        aria-label="Search"
        className={className}
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="w-4 h-4" size={16} />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        width="wide"
        icon={<SearchIcon className="size-3.5 opacity-80" />}
      >
        <CommandInput
          value={value}
          onValueChange={setValue}
          placeholder="Search requests"
          aria-label="Search requests"
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSubmit();
            if (event.key === "Escape" && onClearSearch) handleClear();
          }}
        />
        <CommandList>
          <CommandEmpty />
          {isLoading ? null : results.length > 0 ? (
            <CommandGroup>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setOpen(false);
                    onResultSelect(result);
                  }}
                >
                  {result.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : hasQuery && showNoResults ? (
            <CommandGroup>
              <CommandItem disabled>No results</CommandItem>
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
