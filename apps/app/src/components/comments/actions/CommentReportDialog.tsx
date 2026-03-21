"use client";

import React from "react";
import { ReportDialog } from "@/components/global/ReportDialog";
import type { ReportReason } from "@/types/request";
import { client } from "@featul/api/client";

interface CommentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentId: string;
}

export default function CommentReportDialog({
  open,
  onOpenChange,
  commentId,
}: CommentReportDialogProps) {
  return (
    <ReportDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Report comment"
      description="Help us understand what's wrong with this comment."
      successMessage="Comment reported. Thank you for your feedback."
      errorMessage="Failed to report comment"
      onSubmitReport={async ({
        reason,
        description,
      }: {
        reason: ReportReason;
        description: string;
      }) => {
        const res = await client.comment.report.$post({
          commentId,
          reason,
          description,
        });

        return res.ok;
      }}
    />
  );
}
