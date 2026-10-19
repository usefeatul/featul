"use client";

import React, { useState } from "react";
import { cn } from "@featul/ui/lib/utils";
import {
  Copy,
  EditIcon,
  FlagIcon,
  ShareIcon,
  TrashIcon,
} from "@/components/global/icons";
import { usePostEditAccess } from "@/hooks/usePostEditAccess";
import type { SubdomainRequestDetailData } from "../../../types/subdomain";
import EditPostModal from "./EditPostModal";
import ReportPostDialog from "./ReportPostDialog";
import { useDeletePost } from "./actions/RequestDeleteAction";
import { copyPostLink, sharePostLink } from "./actions/RequestShareAction";

function ActionItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
          destructive
            ? "text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
        )}
      >
        <span className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
        {label}
      </button>
    </li>
  );
}

/** Sidebar list of post actions: share, report, and edit/delete for editors. */
export function PostActionsNav({
  post,
  workspaceSlug,
}: {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { canEdit } = usePostEditAccess({
    workspaceSlug,
    viewerCanEdit: post.viewerCanEdit,
  });
  const deletion = useDeletePost(post.id, workspaceSlug);

  return (
    <section>
      <h2 className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
        Actions
      </h2>
      <ul className="space-y-0.5">
        <ActionItem
          icon={<Copy className="size-4" />}
          label="Copy link"
          onClick={() => copyPostLink()}
        />
        <ActionItem
          icon={<ShareIcon className="size-4" />}
          label="Share"
          onClick={() => sharePostLink(undefined, post.title)}
        />
        <ActionItem
          icon={<FlagIcon className="size-4" />}
          label="Report"
          onClick={() => setReportOpen(true)}
        />
        {canEdit ? (
          <>
            <ActionItem
              icon={<EditIcon className="size-4" />}
              label="Edit post"
              onClick={() => setEditOpen(true)}
            />
            <ActionItem
              icon={<TrashIcon className="size-4" />}
              label="Delete post"
              onClick={deletion.openConfirm}
              destructive
            />
          </>
        ) : null}
      </ul>

      {canEdit ? (
        <EditPostModal
          open={editOpen}
          onOpenChange={setEditOpen}
          workspaceSlug={workspaceSlug}
          post={post}
        />
      ) : null}
      <ReportPostDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        postId={post.id}
      />
      {deletion.dialog}
    </section>
  );
}
