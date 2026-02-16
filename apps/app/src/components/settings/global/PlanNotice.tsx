"use client";

import React from "react";
import { AccentBar } from "@featul/ui/components/cardElements";
import { cn } from "@featul/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import {
  normalizePlan,
  getPlanLimits,
  type PlanKey,
  type PlanLimits,
} from "@/lib/plan";

type Feature =
  | "branding"
  | "team"
  | "domain"
  | "tags"
  | "changelog_tags"
  | "boards"
  | "integrations"
  | "data_imports";

function buildMessage(
  feature: Feature,
  plan: PlanKey,
  limits: PlanLimits,
  counts?: {
    members?: number;
    tags?: number;
    changelogTags?: number;
    boards?: number;
  },
) {
  if (feature === "branding") {
    if (!limits.allowBranding)
      return {
        title: "Branding is available on paid plans",
        detail: "Upgrade to Starter or Professional",
      };
    if (limits.allowHidePoweredBy)
      return {
        title: "Branding unlocked",
        detail: "You can hide 'Powered by' in this plan",
      };
    return {
      title: "Branding enabled",
      detail: "Some options are limited on this plan",
    };
  }
  if (feature === "domain") {
    if (plan === "free")
      return {
        title: "Custom domain available on Starter or Professional",
        detail: "Upgrade to add a custom domain",
      };
    return {
      title: "Custom domain included in your plan",
      detail: "You can configure a custom domain",
    };
  }
  if (feature === "team") {
    if (typeof limits.maxMembers === "number") {
      const used = counts?.members ?? 0;
      return {
        title: `Up to ${limits.maxMembers} members`,
        detail: `${used} currently in workspace`,
      };
    }
    if (limits.maxMembers == null)
      return { title: "Unlimited members", detail: "No limits on this plan" };
  }

  if (feature === "tags") {
    if (typeof limits.maxTags === "number") {
      const used = counts?.tags ?? 0;
      return {
        title: `Up to ${limits.maxTags} tags`,
        detail: `${used} currently in workspace`,
      };
    }
    if (limits.maxTags == null)
      return { title: "Unlimited tags", detail: "No limits on this plan" };
  }
  if (feature === "changelog_tags") {
    if (typeof limits.maxChangelogTags === "number") {
      const used = counts?.changelogTags ?? 0;
      return {
        title: `Up to ${limits.maxChangelogTags} changelog tags`,
        detail: `${used} currently on changelog`,
      };
    }
    if (limits.maxChangelogTags == null)
      return {
        title: "Unlimited changelog tags",
        detail: "No limits on this plan",
      };
  }
  if (feature === "boards") {
    if (typeof limits.maxNonSystemBoards === "number") {
      const used = counts?.boards ?? 0;
      return {
        title: `Up to ${limits.maxNonSystemBoards} boards`,
        detail: `${used} currently in workspace`,
      };
    }
    if (limits.maxNonSystemBoards == null)
      return { title: "Unlimited boards", detail: "No limits on this plan" };
  }
  if (feature === "integrations") {
    if (plan === "free")
      return {
        title: "Integrations are only available on our paid plans",
        detail: "Upgrade to Starter or Professional",
      };
    return {
      title: "Integrations included in your plan",
      detail: "You can use all available integrations",
    };
  }
  if (feature === "data_imports") {
    if (plan === "free")
      return {
        title: "Third-party imports are only available on paid plans",
        detail: "Upgrade to Starter or Professional",
      };
    return {
      title: "Third-party imports included in your plan",
      detail: "Canny, Nolt, and ProductBoard import are coming soon",
    };
  }
  return { title: `Your plan: ${plan}`, detail: "View plan details" };
}

export default function PlanNotice({
  slug,
  feature,
  className,
  plan: rawPlan,
  membersCount,
  tagsCount,
  changelogTagsCount,
  boardsCount,
}: {
  slug: string;
  feature: Feature;
  className?: string;
  plan?: string;
  membersCount?: number;
  tagsCount?: number;
  changelogTagsCount?: number;
  boardsCount?: number;
}) {
  const { data } = useQuery({
    queryKey: ["workspace-plan", slug],
    queryFn: async () => {
      const res = await client.workspace.bySlug.$get({ slug });
      const d = await res.json();
      return String(
        (d as { workspace?: { plan?: string } })?.workspace?.plan || "free",
      );
    },
    enabled: !rawPlan,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const plan = normalizePlan(rawPlan || data || "free");
  const limits = getPlanLimits(plan);
  const msg = buildMessage(feature, plan, limits, {
    members: membersCount,
    tags: tagsCount,
    changelogTags: changelogTagsCount,
    boards: boardsCount,
  });
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-background text-foreground before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)] px-2 py-2 text-xs sm:text-sm",
        className,
      )}
    >
      <div className="relative z-10 flex items-center gap-2">
        <AccentBar width={6} height={30} className="shrink-0" />
        <div className="leading-tight">
          <div className="font-medium">{msg.title}</div>
          {msg.detail ? <div className="text-accent">{msg.detail}</div> : null}
        </div>
      </div>
    </div>
  );
}
