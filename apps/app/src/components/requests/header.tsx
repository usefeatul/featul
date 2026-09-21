"use client";

import Link from "next/link";
import { ChevronsUp, ChevronsDown } from "lucide-react";
import { PanelIcon } from "@featul/ui/icons/panel";
import { Button } from "@featul/ui/components/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip";
import { MergePopover } from "./MergePopover";
import Menu from "./menu";
import { PANEL_ARIA_SHORTCUTS } from "@/hooks/shortcut";
import { PanelShortcutKeys, ShortcutKey } from "@/components/global/keys";

const actionClass = "size-8 rounded-md border-0 bg-transparent p-0 text-accent shadow-none hover:bg-black/[0.06] data-[state=open]:bg-black/[0.06] dark:bg-transparent dark:hover:bg-white/[0.03] dark:data-[state=open]:bg-white/[0.03]";

type HeaderProps = {
  title: string;
  postId: string;
  workspaceSlug: string;
  backHref: string;
  prevHref?: string;
  nextHref?: string;
  readonly?: boolean;
  onOpenList?: () => void;
};

export default function Header({ title, postId, workspaceSlug, backHref, prevHref, nextHref, readonly, onOpenList }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-12 items-center gap-2 bg-background pl-2 pr-4 sm:pr-6">
      {onOpenList ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="plain" className={actionClass} onClick={onOpenList} aria-label="Show request list" aria-keyshortcuts={PANEL_ARIA_SHORTCUTS} aria-expanded={false} aria-controls="request-navigator">
              <PanelIcon className="size-[18px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6} className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium">
            <span>Show request list</span>
            <PanelShortcutKeys />
          </TooltipContent>
        </Tooltip>
      ) : null}
      <nav aria-label="Request navigation" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-2 text-sm">
          <li className="shrink-0">
            <Link href={backHref} className="flex items-center gap-1 rounded-md py-1 text-accent transition-colors hover:text-foreground" aria-label="Back to requests">
              <span>Requests</span>
            </Link>
          </li>
          <li aria-hidden="true" className="hidden text-accent/50 sm:block">/</li>
          <li aria-current="page" className="min-w-0 truncate font-medium" title={title}>{title}</li>
        </ol>
      </nav>
      <div className="flex h-8 shrink-0 items-center gap-1">
        <NavigationButton href={prevHref} direction="up" />
        <NavigationButton href={nextHref} direction="down" />
        {!readonly ? <>
          <MergePopover postId={postId} workspaceSlug={workspaceSlug} className={actionClass} />
        </> : null}
        <Menu postId={postId} workspaceSlug={workspaceSlug} title={title} backHref={backHref} readonly={readonly} className={actionClass} />
      </div>
    </header>
  );
}


function NavigationButton({ href, direction }: { href?: string; direction: "up" | "down" }) {
  const label = direction === "up" ? "Previous request" : "Next request";
  const Icon = direction === "up" ? ChevronsUp : ChevronsDown;
  const shortcut = direction === "up" ? "Z" : "X";

  return (
    <Tooltip>
      {href ? (
        <TooltipTrigger asChild>
          <Button asChild variant="plain" className={actionClass}>
            <Link href={href} prefetch={true} aria-label={label} aria-keyshortcuts={shortcut.toLowerCase()}><Icon className="size-[18px]" /></Link>
          </Button>
        </TooltipTrigger>
      ) : (
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0} aria-label={label}>
            <Button variant="plain" className={actionClass} disabled aria-label={label}>
              <Icon className="size-[18px]" />
            </Button>
          </span>
        </TooltipTrigger>
      )}
      <TooltipContent side="bottom" sideOffset={6} className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium">
        <span>{href ? label : direction === "up" ? "No previous request" : "No next request"}</span>
        <ShortcutKey>{shortcut}</ShortcutKey>
      </TooltipContent>
    </Tooltip>
  );
}
