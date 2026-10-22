"use client";

import { useState } from "react";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { cn } from "@featul/ui/lib/utils";
import { CalendarDays } from "@/components/global/icons";

interface SchedulePickerProps {
  scheduledAt: Date | null;
  onChange: (scheduledAt: Date | null) => void;
  triggerClassName?: string;
}

/** `datetime-local` wants local wall-clock time, not ISO/UTC. */
function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function atNine(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(9, 0, 0, 0);
  return date;
}

function nextMondayAtNine() {
  const day = new Date().getDay();
  return atNine(((8 - day) % 7) || 7);
}

export function formatSchedule(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SchedulePicker({
  scheduledAt,
  onChange,
  triggerClassName,
}: SchedulePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (next) setValue(toLocalInputValue(scheduledAt ?? atNine(1)));
    setOpen(next);
  };

  const picked = value ? new Date(value) : null;
  const isValid = Boolean(picked && picked.getTime() > Date.now());

  const apply = (date: Date) => {
    onChange(date);
    setOpen(false);
  };

  const label = scheduledAt
    ? `Scheduled for ${formatSchedule(scheduledAt)}`
    : "Schedule publish";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="plain"
          size="icon-sm"
          aria-label={label}
          title={label}
          className={cn(
            triggerClassName,
            scheduledAt && "text-primary hover:text-primary dark:text-primary",
          )}
        >
          <CalendarDays className="size-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium">Schedule publish</p>
            <p className="text-xs text-muted-foreground">
              {scheduledAt
                ? `Goes live ${formatSchedule(scheduledAt)}.`
                : "Publish automatically and email subscribers at a set time."}
            </p>
          </div>

          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => apply(atNine(1))}
            >
              Tomorrow 9 AM
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => apply(nextMondayAtNine())}
            >
              Monday 9 AM
            </Button>
          </div>

          <Input
            type="datetime-local"
            value={value}
            min={toLocalInputValue(new Date())}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={value && !isValid ? true : undefined}
            aria-label="Publish date and time"
          />

          <div className="flex justify-end gap-1.5">
            {scheduledAt ? (
              <Button
                variant="plain"
                size="sm"
                className="mr-auto text-xs text-muted-foreground"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Remove schedule
              </Button>
            ) : null}
            <Button
              size="sm"
              className="text-xs"
              disabled={!isValid}
              onClick={() => picked && apply(picked)}
            >
              Schedule
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
