"use client";

import React, { useState } from "react";
import {
  Copy,
  EditIcon,
  FlagIcon,
  ShareIcon,
  TrashIcon,
} from "@/components/global/icons";
import { usePostEditAccess } from "@/hooks/usePostEditAccess";
import type { SubdomainRequestDetailData } from "../../../types/subdomain";
import { SidebarActionItem, SidebarSection } from "../SidebarSection";
import EditPostModal from "./EditPostModal";
import ReportPostDialog from "./ReportPostDialog";
import { useDeletePost } from "./actions/RequestDeleteAction";
import { copyPostLink, sharePostLink } from "./actions/RequestShareAction";

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
    <SidebarSection title="Actions">
      <ul className="space-y-0.5">
        <SidebarActionItem
          icon={<Copy className="size-4" />}
          label="Copy link"
          onClick={() => copyPostLink()}
        />
        <SidebarActionItem
          icon={<ShareIcon className="size-4" />}
          label="Share"
          onClick={() => sharePostLink(undefined, post.title)}
        />
        <SidebarActionItem
          icon={<FlagIcon className="size-4" />}
          label="Report"
          onClick={() => setReportOpen(true)}
        />
        {canEdit ? (
          <>
            <SidebarActionItem
              icon={<EditIcon className="size-4" />}
              label="Edit post"
              onClick={() => setEditOpen(true)}
            />
            <SidebarActionItem
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
    </SidebarSection>
  );
}
