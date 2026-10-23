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

/** A calendar, a time and quick picks; reports a future date on submit. */
export function ScheduleForm({ scheduledAt, onSchedule, onRemove }: ScheduleFormProps) {
  const initial = scheduledAt ?? atNine(1);
  const [day, setDay] = useState<Date | undefined>(initial);
  const [time, setTime] = useState(toTimeValue(initial));

  const picked = combine(day, time);
  const isValid = Boolean(picked && picked.getTime() > Date.now());

  return (
    <div className="flex flex-col">
      <Calendar
        mode="single"
        selected={day}
        onSelect={setDay}
        defaultMonth={day}
        disabled={{ before: startOfToday() }}
        weekStartsOn={1}
        className="p-0"
        classNames={{ root: "w-full" }}
      />

      <div className="-mx-3 mt-3 flex items-center justify-between gap-3 border-t border-border/70 px-3 pt-3 dark:border-white/[0.06]">
        <label htmlFor="schedule-time" className="text-xs text-muted-foreground">
          Time
        </label>
        <Input
          id="schedule-time"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          aria-invalid={picked && !isValid ? true : undefined}
          className="w-28 [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>

      <div className="mt-3 flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onSchedule(atNine(1))}
        >
          Tomorrow 9 AM
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onSchedule(nextMondayAtNine())}
        >
          Monday 9 AM
        </Button>
      </div>

      <div className="mt-1.5 flex gap-1.5">
        {scheduledAt && onRemove ? (
          <Button
            variant="plain"
            size="sm"
            className="flex-1 bg-transparent text-xs text-muted-foreground hover:text-foreground dark:bg-transparent dark:text-muted-foreground dark:hover:text-foreground"
            onClick={onRemove}
          >
            Remove
          </Button>
        ) : null}
        <Button
          size="sm"
          className="flex-1 text-xs"
          disabled={!isValid}
          onClick={() => picked && onSchedule(picked)}
        >
          Schedule
        </Button>
      </div>
    </div>
  );
}
