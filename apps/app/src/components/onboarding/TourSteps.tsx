import type React from "react";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { CollectIcon } from "@featul/ui/icons/collect";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { BoardIcon } from "@featul/ui/icons/board";

export type WelcomeTourStep = {
  id: string;
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  accentClassName: string;
};

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
      icon: <FeatulLogoIcon className="size-7" />,
      accentClassName: "bg-primary/10 text-primary",
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
      icon: <CollectIcon className="size-7" />,
      accentClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
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
      icon: <RoadmapIcon className="size-7" />,
      accentClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
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
      icon: <ChangelogIcon className="size-7" />,
      accentClassName: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
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
      icon: <BoardIcon className="size-7" />,
      accentClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];
}
