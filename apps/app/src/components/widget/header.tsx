"use client";

import { ChevronLeft, X } from "lucide-react";
import { FillFeedbackIcon } from "@featul/ui/icons/fill-feedback";
import { FillPenIcon } from "@featul/ui/icons/fill-pen";
import { WidgetImage } from "./image";
import { WidgetHeaderSkeleton } from "./skeleton";
import type { FeedbackView } from "./types";

type Props = {
  workspaceName: string;
  workspaceLogo: string | null;
  showSubpageHeader: boolean;
  isChangelogDetail: boolean;
  isFeedback: boolean;
  feedbackView: FeedbackView;
  feedbackTitle: string;
  fullscreen?: boolean;
  loading?: boolean;
  hideCompose?: boolean;
  onBack: () => void;
  onCompose: () => void;
  onClose: () => void;
};

export function Header({
  workspaceName,
  workspaceLogo,
  showSubpageHeader,
  isChangelogDetail,
  isFeedback,
  feedbackView,
  feedbackTitle,
  fullscreen = false,
  loading = false,
  hideCompose = false,
  onBack,
  onCompose,
  onClose,
}: Props) {
  return (
    <header
      className={`flex shrink-0 items-center gap-2 px-4 py-3 min-[380px]:gap-2.5 ${
        fullscreen ? "min-h-12" : ""
      }`}
    >
      {loading && !showSubpageHeader ? (
        <>
          <WidgetHeaderSkeleton />
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
            aria-label="Close widget"
          >
            <X className="size-4" />
          </button>
        </>
      ) : (
        <>
          {showSubpageHeader ? (
            <button
              type="button"
              onClick={onBack}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-transparent text-[rgb(var(--widget-fg)/0.55)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
              aria-label="Back"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <div
              className={`flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md ${
                workspaceLogo ? "" : "bg-[rgb(var(--widget-fg)/0.06)]"
              }`}
            >
              {workspaceLogo ? (
                <WidgetImage
                  url={workspaceLogo}
                  alt=""
                  className="size-full"
                  imgClassName="size-full object-contain"
                  preview={false}
                />
              ) : (
                <FillFeedbackIcon className="size-4 text-[rgb(var(--widget-fg))]" size={16} />
              )}
            </div>
          )}

          {isFeedback && feedbackView === "detail" ? (
            <div className="min-w-0 flex-1" />
          ) : isChangelogDetail ? (
            <div className="min-w-0 flex-1" />
          ) : isFeedback && feedbackView === "compose" ? (
            <p className="min-w-0 flex-1 text-[15px] font-semibold tracking-tight">{feedbackTitle}</p>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight">{workspaceName}</p>
            </div>
          )}

          {!showSubpageHeader && !hideCompose ? (
            <button
              type="button"
              onClick={onCompose}
              aria-label="Give feedback"
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[rgb(var(--widget-cta))] px-2.5 text-xs font-semibold text-[rgb(var(--widget-cta-fg))] transition-opacity hover:opacity-90 min-[380px]:px-3"
            >
              <FillPenIcon className="size-3.5" size={14} />
              <span className="hidden min-[360px]:inline">Give feedback</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
            aria-label="Close widget"
          >
            <X className="size-4" />
          </button>
        </>
      )}
    </header>
  );
}
