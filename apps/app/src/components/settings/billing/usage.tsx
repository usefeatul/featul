import type React from "react";
import { getPlanLimits } from "@featul/api/shared/plan";
import {
  ArticleIcon,
  BoardIcon,
  BookIcon,
  MemberIcon,
  TagIcon,
  IntegrationIcon,
} from "@/components/global/icons";
import type { PlanKey } from "@/lib/plan";
import type { BillingUsage } from "@/types/billing";
import { cn } from "@featul/ui/lib/utils";
import SectionCard from "../global/SectionCard";
import { usageFillClass, usageTrackClass } from "./styles";

/** One usage row: label on the left, a dotted meter with "used / included" on the right. */
export function UsageMeter({
  label,
  icon: Icon,
  used,
  limit,
  unit = "used",
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  used: number;
  limit: number | null;
  unit?: string;
}) {
  const atLimit = limit !== null && used >= limit;
  const percentage = limit === null ? 0 : Math.min(100, (used / Math.max(1, limit)) * 100);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3 text-sm">
        <Icon className="size-4 text-muted-foreground" />
        {label}
      </div>
      <div className="w-40 sm:w-48">
        <div className="mb-2 flex items-baseline justify-between gap-2 text-xs tabular-nums">
          <span className={cn("font-medium", atLimit ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
            {used} {unit}
          </span>
          <span className="text-muted-foreground">{limit === null ? "Unlimited" : `${limit} included`}</span>
        </div>
        {limit !== null ? (
          <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(used, limit)}
            aria-valuetext={`${used} of ${limit} ${unit}${atLimit ? ", limit reached" : ""}`}
            className={usageTrackClass}
          >
            <div
              key={`${used}-${limit}`}
              className={cn(usageFillClass, atLimit ? "bg-amber-500" : "bg-primary")}
              style={{ width: `${percentage}%` }}
            />
          </div>
        ) : (
          <div className={usageTrackClass} />
        )}
      </div>
    </div>
  );
}

export default function Usage({
  plan,
  usage,
}: {
  plan: PlanKey;
  usage: BillingUsage;
}) {
  const limits = getPlanLimits(plan);
  const rows = [
    {
      label: "Feedback boards",
      icon: BoardIcon,
      used: usage.boards,
      limit: limits.maxNonSystemBoards,
    },
    {
      label: "Team members",
      icon: MemberIcon,
      used: usage.members,
      limit: limits.maxMembers,
    },
    {
      label: "Feedback tags",
      icon: TagIcon,
      used: usage.tags,
      limit: limits.maxTags,
    },
    {
      label: "Help collections",
      icon: BookIcon,
      used: usage.helpCollections,
      limit: limits.maxHelpCollections,
    },
    {
      label: "Published help articles",
      icon: ArticleIcon,
      used: usage.helpArticles,
      limit: limits.maxHelpArticles,
    },
  ];

  return (
    <SectionCard title="Workspace usage" contentClassName="py-0">
      <div className="-mx-5 divide-y divide-border/50">
        {rows.map((row) => (
          <UsageMeter key={row.label} {...row} />
        ))}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm">
          <div className="flex items-center gap-3">
            <IntegrationIcon className="size-4 text-muted-foreground" />
            Integrations
          </div>
          <span className="text-xs text-muted-foreground">
            {limits.allowIntegrations
              ? `${usage.integrations} connected · Included`
              : `${usage.integrations} connected · Paid plans`}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
