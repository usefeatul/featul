"use client";

import { Button } from "@featul/ui/components/button";
import { FillPlusIcon } from "@featul/ui/icons/fill-plus";

export default function RoadmapEmptyColumn({
  label,
  onCreate,
}: {
  label: string;
  onCreate?: () => void;
}) {
  return (
    <li className="flex min-h-[152px] flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-background/50 px-4 py-6 text-center">
      <p className="text-xs text-accent">No items in {label}</p>
      {onCreate ? (
        <Button
          type="button"
          variant="plain"
          size="sm"
          className="mt-2 h-7 gap-1.5 px-2 text-xs text-accent hover:text-foreground"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onCreate();
          }}
        >
          <FillPlusIcon className="size-3.5" size={14} />
          Add item
        </Button>
      ) : null}
    </li>
  );
}
