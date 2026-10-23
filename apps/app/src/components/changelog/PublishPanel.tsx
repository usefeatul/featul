"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import {
  inputSurfaceClass,
  modalCardInnerClass,
  modalCardShellClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { publicBoardUrlForWorkspace } from "@/config/nav";
import { ActionTooltip } from "@/components/global/ActionTooltip";
import {
  CalendarDays,
  Check,
  Copy,
  DomainIcon,
  TagIcon,
  AccountIcon,
} from "@/components/global/icons";
import { TagDot } from "@/components/global/tag";
import type { Member } from "@/types/team";
import { randomAvatarUrl } from "@/utils/avatar";
import { getInitials } from "@/utils/user";
import { EntryUrlRow } from "./EntryUrlRow";
import { ScheduleForm, formatSchedule } from "./ScheduleForm";
import type { WorkspaceTag } from "@/types/changelog";

interface PublishPanelProps {
  workspaceSlug: string;
  /** Unset until the entry is first saved; the URL can't be edited before then. */
  entryId?: string;
  entrySlug: string;
  onEntrySlugChange: (entrySlug: string) => void;
  isDraft: boolean;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  onPublish: () => void;
  onUnpublish: () => void;
  onScheduleChange: (scheduledAt: Date | null) => void;
  members: Member[];
  authorIds: string[];
  onAuthorIdsChange: (authorIds: string[]) => void;
  tags: WorkspaceTag[];
  selectedTagIds: string[];
  onTagIdsChange: (tagIds: string[]) => void;
}

function shortDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function memberName(member: Member) {
  return member.name || member.email?.split("@")[0] || "Member";
}

/** Status pill in the editor header; the popover holds publishing, scheduling, URL, authors and tags. */
export function PublishPanel({
  workspaceSlug,
  entryId,
  entrySlug,
  onEntrySlugChange,
  isDraft,
  scheduledAt,
  publishedAt,
  onPublish,
  onUnpublish,
  onScheduleChange,
  members,
  authorIds,
  onAuthorIdsChange,
  tags,
  selectedTagIds,
  onTagIdsChange,
}: PublishPanelProps) {
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const origin = publicBoardUrlForWorkspace(workspaceSlug);

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

  const close = () => {
    setScheduleOpen(false);
    setOpen(false);
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
                setScheduleOpen(false);
        }
      }}
    >
      <ActionTooltip label={open ? "Hide details" : "Show details"}>
        <PopoverTrigger asChild>
          <button
            type="button"
            // The faintest surface shadow, so the pill sits almost flat in the header.
            className={cn(
              inputSurfaceClass,
              "flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-[filter,color] hover:text-foreground hover:brightness-[0.98] data-[state=open]:text-foreground dark:hover:brightness-125",
            )}
          >
            {status.trigger}
            <span className="relative flex size-1.5" aria-hidden="true">
              {!isDraft ? (
                // Live entries breathe; drafts and schedules stay still.
                <span
                  className={cn(
                    "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:hidden",
                    status.dot,
                  )}
                />
              ) : null}
              <span className={cn("relative inline-flex size-1.5 rounded-full", status.dot)} />
            </span>
          </button>
        </PopoverTrigger>
      </ActionTooltip>

      <PopoverContent
        align="end"
        className="w-[22rem]"
        // Opening shouldn't drop the caret into the URL field and select the slug.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          if (event.target instanceof HTMLElement && event.target.dataset.pendingEdit) {
            event.preventDefault();
          }
        }}
      >
        <div className="flex flex-col gap-2.5">
          <div className="px-1 pt-0.5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className={cn("size-1.5 rounded-full", status.dot)} aria-hidden="true" />
              {status.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{status.detail}</p>
          </div>

          <PanelCard title="Publishing">
            {isDraft ? (
              <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <PopoverTrigger asChild>
                  <RowButton
                    icon={<CalendarDays className="size-3.5" />}
                    label="Schedule"
                    value={scheduledAt ? formatSchedule(scheduledAt) : "Not set"}
                    muted={!scheduledAt}
                    open={scheduleOpen}
                  />
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={6} className="w-auto">
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

            <EntryUrlRow
              icon={<DomainIcon className="size-3.5" />}
              workspaceSlug={workspaceSlug}
              entryId={entryId}
              entrySlug={entrySlug}
              isPublished={!isDraft}
              onSaved={onEntrySlugChange}
            />
          </PanelCard>

          <PanelCard title="Details">
            <AuthorsRow
              members={members}
              authorIds={authorIds}
              onChange={onAuthorIdsChange}
            />
            <TagsRow
              tags={tags}
              selectedTagIds={selectedTagIds}
              onChange={onTagIdsChange}
            />
          </PanelCard>

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

/** Settings-card frame: a labelled shell around a raised list of rows. */
function PanelCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(modalCardShellClass, "rounded-xl")}>
      <h3 className="px-2.5 pt-1 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div
        className={cn(
          modalCardInnerClass,
          "rounded-lg divide-y divide-border/60 dark:divide-white/[0.06]",
        )}
      >
        {children}
      </div>
    </section>
  );
}

type RowButtonProps = Omit<ComponentProps<"button">, "value"> & {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  open: boolean;
  muted?: boolean;
};

/** One line of a card: icon, label, value and a chevron. Doubles as a popover trigger. */
function RowButton({
  icon,
  label,
  value,
  open,
  muted = false,
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
        "flex h-10 w-full cursor-pointer items-center gap-2 px-3 text-left text-xs transition-colors hover:bg-muted/40 disabled:cursor-default disabled:hover:bg-transparent data-[state=open]:bg-muted/40",
        className,
      )}
      {...props}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          "ml-auto flex min-w-0 items-center justify-end gap-1.5 font-medium",
          muted && "font-normal text-muted-foreground",
        )}
      >
        {typeof value === "string" ? <span className="truncate">{value}</span> : value}
      </span>
    </button>
  );
}

function MemberAvatar({ member, className }: { member: Member; className?: string }) {
  const name = memberName(member);
  return (
    <Avatar className={cn("size-5 ring-2 ring-card", className)}>
      <AvatarImage src={member.image || randomAvatarUrl(member.userId)} alt={name} />
      <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** Credited authors, picked from the workspace team. At least one stays selected. */
function AuthorsRow({
  members,
  authorIds,
  onChange,
}: {
  members: Member[];
  authorIds: string[];
  onChange: (authorIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const byId = new Map(members.map((member) => [member.userId, member]));
  const selected = authorIds
    .map((id) => byId.get(id))
    .filter((member): member is Member => Boolean(member));

  const toggle = (userId: string) => {
    if (authorIds.includes(userId)) {
      if (authorIds.length === 1) return;
      onChange(authorIds.filter((id) => id !== userId));
    } else {
      onChange([...authorIds, userId]);
    }
  };

  const loading = members.length === 0 && authorIds.length > 0;
  const value =
    selected.length === 0 ? (
      loading ? "Loading…" : "Choose"
    ) : (
      <>
        <span className="flex -space-x-1.5">
          {selected.slice(0, 3).map((member) => (
            <MemberAvatar key={member.userId} member={member} />
          ))}
        </span>
        <span className="truncate">
          {selected.length === 1 ? memberName(selected[0]!) : `${selected.length} authors`}
        </span>
      </>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <RowButton
          icon={<AccountIcon className="size-3.5" />}
          label="Authors"
          value={value}
          muted={selected.length === 0}
          open={open}
        />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} list className="w-fit min-w-0">
        {members.length === 0 ? (
          <div className="p-2 text-xs text-muted-foreground">Loading team…</div>
        ) : (
          <PopoverList>
            {members.map((member) => {
              const checked = authorIds.includes(member.userId);
              const locked = checked && authorIds.length === 1;
              return (
                <PopoverListItem
                  key={member.userId}
                  role="menuitemcheckbox"
                  aria-checked={checked}
                  aria-disabled={locked || undefined}
                  title={locked ? "An entry needs at least one author" : undefined}
                  onClick={() => toggle(member.userId)}
                  className={cn(locked && "cursor-default")}
                >
                  <MemberAvatar member={member} className="ring-0" />
                  <span className="min-w-28 max-w-48 truncate text-sm">{memberName(member)}</span>
                  <Check
                    className={cn("ml-auto size-3.5 shrink-0 text-primary", !checked && "invisible")}
                    aria-hidden="true"
                  />
                </PopoverListItem>
              );
            })}
          </PopoverList>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Workspace changelog tags, toggled on and off. */
function TagsRow({
  tags,
  selectedTagIds,
  onChange,
}: {
  tags: WorkspaceTag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = tags.filter((tag) => selectedTagIds.includes(tag.id));

  const toggle = (tagId: string) =>
    onChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId],
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <RowButton
          icon={<TagIcon className="size-3.5" />}
          label="Tags"
          value={selected.length === 0 ? "None" : selected.map((tag) => tag.name).join(", ")}
          muted={selected.length === 0}
          open={open}
        />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} list className="w-fit min-w-0">
        {tags.length === 0 ? (
          <div className="p-2 text-xs text-muted-foreground">
            No tags yet. Add them in changelog settings.
          </div>
        ) : (
          <PopoverList>
            {tags.map((tag) => {
              const checked = selectedTagIds.includes(tag.id);
              return (
                <PopoverListItem
                  key={tag.id}
                  role="menuitemcheckbox"
                  aria-checked={checked}
                  onClick={() => toggle(tag.id)}
                >
                  <TagDot />
                  <span className="max-w-40 min-w-24 truncate text-sm">{tag.name}</span>
                  <Check
                    className={cn("ml-auto size-3.5 shrink-0 text-primary", !checked && "invisible")}
                    aria-hidden="true"
                  />
                </PopoverListItem>
              );
            })}
          </PopoverList>
        )}
      </PopoverContent>
    </Popover>
  );
}
