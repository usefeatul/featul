import type React from "react";
import { ArrowBigUp, CheckCircle } from "@/components/global/icons";

export type WelcomeTourStep = {
  id: string;
  title: string;
  description: React.ReactNode;
  /** One real product row shown on the dither plate above the copy. */
  detail: React.ReactNode;
};

const rowClass =
  "flex w-[min(100%,22rem)] items-center gap-3 rounded-lg bg-white px-3.5 py-3 text-left text-sm text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_-12px_rgba(0,0,0,0.35)]";

function RequestRow({
  title,
  status,
  votes,
}: {
  title: string;
  status: React.ReactNode;
  votes: number;
}) {
  return (
    <div className={rowClass}>
      <span className="flex w-9 shrink-0 flex-col items-center rounded-md border border-zinc-200 py-1 text-[11px] font-medium tabular-nums text-zinc-700">
        <ArrowBigUp className="size-3.5" />
        {votes}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{status}</span>
      </span>
    </div>
  );
}

function StatusDot({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-1.5 rounded-full ${className}`} />
      {children}
    </span>
  );
}

export function buildWelcomeTourSteps(input: {
  workspaceName: string;
  workspaceSlug: string;
}): WelcomeTourStep[] {
  const publicUrl = `${input.workspaceSlug}.featul.com`;

  return [
    {
      id: "welcome",
      title: `Welcome to ${input.workspaceName}`,
      description: (
        <>
          Your workspace is ready. We added a few sample requests so you can
          explore how feedback flows through Featul.
        </>
      ),
      detail: (
        <RequestRow
          title="Add keyboard shortcuts"
          status={<StatusDot className="bg-zinc-400">Open</StatusDot>}
          votes={31}
        />
      ),
    },
    {
      id: "requests",
      title: "Collect and triage feedback",
      description: (
        <>
          Use <span className="font-medium text-foreground">Requests</span> to
          track feature ideas, bugs, and votes. Move items through statuses like
          Planned, Progress, and Completed.
        </>
      ),
      detail: (
        <RequestRow
          title="Dark mode for the dashboard"
          status={<StatusDot className="bg-sky-500">Planned</StatusDot>}
          votes={24}
        />
      ),
    },
    {
      id: "roadmap",
      title: "Share your roadmap",
      description: (
        <>
          Show customers what you are building next with a public{" "}
          <span className="font-medium text-foreground">Roadmap</span>. Keep
          everyone aligned on priorities.
        </>
      ),
      detail: (
        <RequestRow
          title="Export feedback to CSV"
          status={<StatusDot className="bg-amber-500">In progress</StatusDot>}
          votes={18}
        />
      ),
    },
    {
      id: "changelog",
      title: "Announce what shipped",
      description: (
        <>
          Publish release notes in your{" "}
          <span className="font-medium text-foreground">Changelog</span> so users
          always know what changed and why it matters.
        </>
      ),
      detail: (
        <div className={rowClass}>
          <CheckCircle className="size-5 shrink-0 text-emerald-500" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              Keyboard shortcuts are here
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500">
              Shipped today · 31 people notified
            </span>
          </span>
        </div>
      ),
    },
    {
      id: "board",
      title: "Go live with your board",
      description: (
        <>
          Your public feedback board lives at{" "}
          <span className="font-medium text-foreground">{publicUrl}</span>.
          Customize branding in Settings whenever you are ready.
        </>
      ),
      detail: (
        <div className={rowClass}>
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="min-w-0 flex-1 truncate font-medium">{publicUrl}</span>
          <span className="text-xs text-zinc-500">Live</span>
        </div>
      ),
    },
  ];
}
