import type React from "react";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { CollectIcon } from "@featul/ui/icons/collect";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { BoardIcon } from "@featul/ui/icons/board";

export type WelcomeTourStep = {
  id: string;
  label: string;
  title: string;
  description: React.ReactNode;
  highlights: string[];
  tip?: string;
  icon: React.ReactNode;
  accentClassName: string;
  glowClassName: string;
};

export function buildWelcomeTourSteps(input: {
  workspaceName: string;
  workspaceSlug: string;
}): WelcomeTourStep[] {
  const publicUrl = `${input.workspaceSlug}.featul.com`;

  return [
    {
      id: "welcome",
      label: "Getting started",
      title: `Welcome to ${input.workspaceName}`,
      description: (
        <>
          Your workspace is ready. We added a few sample requests so you can
          explore how feedback flows through Featul.
        </>
      ),
      highlights: ["Sample requests", "Ready to explore"],
      tip: "Browse the request list on your left to see how items are organized.",
      icon: <FeatulLogoIcon className="size-8" />,
      accentClassName:
        "border-primary/20 bg-primary/10 text-primary shadow-[0_8px_24px_-8px] shadow-primary/25",
      glowClassName: "bg-primary/20",
    },
    {
      id: "requests",
      label: "Feedback",
      title: "Collect and triage feedback",
      description: (
        <>
          Use Requests to track feature ideas, bugs, and votes. Move items
          through statuses like Planned, Progress, and Completed.
        </>
      ),
      highlights: ["Votes", "Statuses", "Tags"],
      tip: "Try creating a post with the Create Posts button in the sidebar.",
      icon: <CollectIcon className="size-8" />,
      accentClassName:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-[0_8px_24px_-8px] shadow-emerald-500/20 dark:text-emerald-400",
      glowClassName: "bg-emerald-500/20",
    },
    {
      id: "roadmap",
      label: "Roadmap",
      title: "Share your roadmap",
      description: (
        <>
          Show customers what you are building next with a public Roadmap. Keep
          everyone aligned on priorities.
        </>
      ),
      highlights: ["Public view", "Drag & drop"],
      tip: "Move requests into roadmap columns to show what is planned next.",
      icon: <RoadmapIcon className="size-8" />,
      accentClassName:
        "border-sky-500/20 bg-sky-500/10 text-sky-600 shadow-[0_8px_24px_-8px] shadow-sky-500/20 dark:text-sky-400",
      glowClassName: "bg-sky-500/20",
    },
    {
      id: "changelog",
      label: "Changelog",
      title: "Announce what shipped",
      description: (
        <>
          Publish release notes in your Changelog so users always know what
          changed and why it matters.
        </>
      ),
      highlights: ["Release notes", "Rich editor"],
      tip: "Link changelog entries back to the requests that inspired them.",
      icon: <ChangelogIcon className="size-8" />,
      accentClassName:
        "border-violet-500/20 bg-violet-500/10 text-violet-600 shadow-[0_8px_24px_-8px] shadow-violet-500/20 dark:text-violet-400",
      glowClassName: "bg-violet-500/20",
    },
    {
      id: "board",
      label: "Public board",
      title: "Go live with your board",
      description: (
        <>
          Your public feedback board lives at{" "}
          <span className="font-medium text-foreground">{publicUrl}</span>.
          Customize branding in Settings whenever you are ready.
        </>
      ),
      highlights: ["Custom domain", "Branding"],
      tip: "Open My Board from the sidebar to preview what customers will see.",
      icon: <BoardIcon className="size-8" />,
      accentClassName:
        "border-amber-500/20 bg-amber-500/10 text-amber-600 shadow-[0_8px_24px_-8px] shadow-amber-500/20 dark:text-amber-400",
      glowClassName: "bg-amber-500/20",
    },
  ];
}
