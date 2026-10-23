"use client";

import { useState } from "react";
import { Button } from "@featul/ui/components/button";
import { Calendar } from "@featul/ui/components/calendar";
import { Input } from "@featul/ui/components/input";

interface ScheduleFormProps {
  scheduledAt: Date | null;
  onSchedule: (scheduledAt: Date) => void;
  /** Shown when there is a schedule to clear. */
  onRemove?: () => void;
}

/** `type="time"` wants local wall-clock `HH:mm`. */
function toTimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function combine(day: Date | undefined, time: string) {
  if (!day || !time) return null;
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const date = new Date(day);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function atNine(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(9, 0, 0, 0);
  return date;
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

/** A compact calendar and a time; reports a future date on submit. */
export function ScheduleForm({ scheduledAt, onSchedule, onRemove }: ScheduleFormProps) {
  const initial = scheduledAt ?? atNine(1);
  const [day, setDay] = useState<Date | undefined>(initial);
  const [time, setTime] = useState(toTimeValue(initial));

  const picked = combine(day, time);
  const isValid = Boolean(picked && picked.getTime() > Date.now());

  return (
    <div className="flex w-fit flex-col gap-3">
      <Calendar
        mode="single"
        selected={day}
        onSelect={setDay}
        defaultMonth={day}
        disabled={{ before: startOfToday() }}
        weekStartsOn={1}
        showOutsideDays={false}
        className="p-0 [--cell-size:--spacing(8)]"
        classNames={{
          caption_label: "text-[13px] font-medium",
          weekday:
            "flex-1 select-none text-[11px] font-normal text-muted-foreground/70",
          week: "mt-1 flex w-full",
          today:
            "rounded-md font-semibold text-primary data-[selected=true]:text-primary-foreground",
        }}
      />

      <div className="flex items-center gap-1.5 border-t border-border/60 pt-3 dark:border-white/[0.06]">
        <Input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          aria-invalid={picked && !isValid ? true : undefined}
          aria-label="Publish time"
          className="h-8 w-24 text-[13px] [&::-webkit-calendar-picker-indicator]:hidden"
        />
        {scheduledAt && onRemove ? (
          <Button
            variant="plain"
            size="sm"
            className="ml-auto h-8 bg-transparent px-2 text-xs text-muted-foreground hover:text-foreground dark:bg-transparent dark:text-muted-foreground dark:hover:text-foreground"
            onClick={onRemove}
          >
            Remove
          </Button>
        ) : null}
        <Button
          size="sm"
          className={scheduledAt && onRemove ? "h-8 text-xs" : "ml-auto h-8 text-xs"}
          disabled={!isValid}
          onClick={() => picked && onSchedule(picked)}
        >
          Schedule
        </Button>
      </div>
    </div>
  );
}
