"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { publicBoardUrlForWorkspace } from "@/config/nav";
import {
  CalendarDays,
  ChevronDown,
  Copy,
  DomainIcon,
} from "@/components/global/icons";
import { EntryUrlForm } from "./EntryUrlForm";
import { ScheduleForm, formatSchedule } from "./ScheduleForm";

interface PublishPanelProps {
  workspaceSlug: string;
  /** Unset until the entry is first saved; the URL can't be edited before then. */
  entryId?: string;
  entrySlug: string;
  onEntrySlugChange: (entrySlug: string) => void;
  title: string;
  isDraft: boolean;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  onPublish: () => void;
  onUnpublish: () => void;
  onScheduleChange: (scheduledAt: Date | null) => void;
}

type Section = "url";

function shortDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Status pill in the editor header; the popover holds publishing, scheduling and the URL. */
export function PublishPanel({
  workspaceSlug,
  entryId,
  entrySlug,
  onEntrySlugChange,
  title,
  isDraft,
  scheduledAt,
  publishedAt,
  onPublish,
  onUnpublish,
  onScheduleChange,
}: PublishPanelProps) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const origin = publicBoardUrlForWorkspace(workspaceSlug);
  const host = origin.replace(/^https?:\/\//, "");

  const status = !isDraft
    ? {
        label: "Published",
        trigger: publishedAt ? `Published ${shortDate(publishedAt)}` : "Published",
        dot: "bg-emerald-500",
        detail: publishedAt
          ? `Live since ${publishedAt.toLocaleDateString(undefined, { dateStyle: "medium" })}.`
          : "Live on your public changelog.",
      }
    : scheduledAt
      ? {
          label: "Scheduled",
          trigger: `Scheduled ${shortDate(scheduledAt)}`,
          dot: "bg-amber-500",
          detail: `Goes live ${formatSchedule(scheduledAt)} and emails subscribers.`,
        }
      : {
          label: "Draft",
          trigger: "Draft",
          dot: "bg-muted-foreground/50",
          detail: "Only your team can see this entry.",
        };

  const toggle = (next: Section) =>
    setSection((current) => (current === next ? null : next));

  const close = () => {
    setScheduleOpen(false);
    setOpen(false);
    setSection(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${origin}/changelog/p/${entrySlug}`);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSection(null);
          setScheduleOpen(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            raisedSurfaceClass,
            "flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-[filter,color] hover:text-foreground hover:brightness-[0.98] data-[state=open]:text-foreground dark:hover:brightness-125",
          )}
        >
          <span className={cn("size-1.5 rounded-full", status.dot)} aria-hidden="true" />
          {status.trigger}
          <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80">
        <div className="flex flex-col gap-3">
          <div className="px-0.5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className={cn("size-1.5 rounded-full", status.dot)} aria-hidden="true" />
              {status.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{status.detail}</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/70 dark:border-white/[0.06]">
            {isDraft ? (
              <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <PopoverTrigger asChild>
                  <RowButton
                    icon={<CalendarDays className="size-3.5" />}
                    label="Schedule"
                    value={scheduledAt ? formatSchedule(scheduledAt) : "Not set"}
                    open={scheduleOpen}
                  />
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={6} className="w-72">
                  <ScheduleForm
                    scheduledAt={scheduledAt}
                    onSchedule={(date) => {
                      onScheduleChange(date);
                      close();
                    }}
                    onRemove={() => {
                      onScheduleChange(null);
                      setScheduleOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            ) : null}

            <Row
              icon={<DomainIcon className="size-3.5" />}
              label="URL"
              value={entryId && entrySlug ? `/p/${entrySlug}` : "Set after first save"}
              disabled={!entryId || !entrySlug}
              open={section === "url"}
              onToggle={() => toggle("url")}
            >
              <p className="mb-1.5 truncate text-xs text-muted-foreground" title={host}>
                {host}/changelog/p/
              </p>
              {entryId ? (
                <EntryUrlForm
                  workspaceSlug={workspaceSlug}
                  entryId={entryId}
                  entrySlug={entrySlug}
                  title={title}
                  isPublished={!isDraft}
                  onSaved={(next) => {
                    onEntrySlugChange(next);
                    setSection(null);
                  }}
                />
              ) : null}
            </Row>
          </div>

          {isDraft ? (
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                onPublish();
                close();
              }}
            >
              Publish now
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={!entrySlug}
                onClick={copyLink}
              >
                <Copy className="size-3.5" />
                Copy link
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  onUnpublish();
                  close();
                }}
              >
                Unpublish
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type RowButtonProps = Omit<ComponentProps<"button">, "value"> & {
  icon: ReactNode;
  label: string;
  value: string;
  open: boolean;
};

/** One line of the settings list: icon, label, value and a chevron. Doubles as a popover trigger. */
function RowButton({
  icon,
  label,
  value,
  open,
  disabled,
  className,
  ...props
}: RowButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-expanded={open}
      className={cn(
        "flex h-9 w-full cursor-pointer items-center gap-2 px-2.5 text-left text-xs transition-colors not-first:border-t not-first:border-border/70 hover:bg-muted/50 disabled:cursor-default disabled:hover:bg-transparent data-[state=open]:bg-muted/50 dark:not-first:border-white/[0.06]",
        className,
      )}
      {...props}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "ml-auto min-w-0 truncate font-medium",
          disabled && "font-normal text-muted-foreground",
        )}
      >
        {value}
      </span>
      {disabled ? null : (
        <ChevronDown
          className={cn(
            "size-3 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/** A row that expands its settings in place underneath. */
function Row({
  children,
  onToggle,
  ...props
}: Omit<RowButtonProps, "onClick"> & { onToggle: () => void; children: ReactNode }) {
  return (
    <div className="not-first:border-t not-first:border-border/70 dark:not-first:border-white/[0.06]">
      <RowButton {...props} onClick={onToggle} />
      {props.open ? (
        <div className="border-t border-border/70 bg-muted/20 p-2.5 dark:border-white/[0.06]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
