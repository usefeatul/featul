"use client";

import React from "react";
import { ReportDialog } from "@/components/global/ReportDialog";
import { client } from "@featul/api/client";
import type { ReportReason } from "@/types/request";

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

export default function ReportPostDialog({
  open,
  onOpenChange,
  postId,
}: ReportPostDialogProps) {
  return (
    <ReportDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Report post"
      description="Help us understand what's wrong with this post."
      successMessage="Post reported. Thank you for your feedback."
      errorMessage="Failed to report post"
      onSubmitReport={async ({
        reason,
        description,
      }: {
        reason: ReportReason;
        description: string;
      }) => {
        const res = await client.post.report.$post({
          postId,
          reason,
          description,
        });

        return res.ok;
      }}
    />
  );
}
