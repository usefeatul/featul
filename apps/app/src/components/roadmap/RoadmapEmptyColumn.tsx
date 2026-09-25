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
    <li className="flex min-h-[108px] flex-1 flex-col rounded-lg border border-dashed border-border/50 bg-muted/20 dark:border-white/[0.07] dark:bg-white/[0.02]">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 text-center">
        <p className="text-xs text-accent">No items in {label}</p>
        {onCreate ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="mt-2 h-7 gap-1.5 px-2 text-xs"
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
      </div>
    </li>
  );
}
