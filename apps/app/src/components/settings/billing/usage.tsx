import { getPlanLimits } from "@featul/api/shared/plan";
import {
  BoardIcon,
  MemberIcon,
  TagIcon,
  IntegrationIcon,
} from "@/components/global/icons";
import type { PlanKey } from "@/lib/plan";
import type { BillingUsage } from "@/types/billing";
import { cn } from "@featul/ui/lib/utils";
import SectionCard from "../global/SectionCard";
import styles from "./usage.module.css";

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
  ];

  return (
    <SectionCard title="Workspace usage" contentClassName="py-0">
      <div className="-mx-5 divide-y divide-border/50">
        {rows.map(({ label, icon: Icon, used, limit }) => {
          const atLimit = limit !== null && used >= limit;
          const percentage =
            limit === null
              ? 0
              : Math.min(100, (used / Math.max(1, limit)) * 100);
          return (
            <div
              key={label}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex items-center gap-3 text-sm">
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </div>
              <div className="w-40 sm:w-48">
                <div className="mb-2 flex items-baseline justify-between gap-2 text-xs tabular-nums">
                  <span
                    className={cn(
                      "font-medium",
                      atLimit
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-foreground",
                    )}
                  >
                    {used} used
                  </span>
                  <span className="text-muted-foreground">
                    {limit === null ? "Unlimited" : `${limit} included`}
                  </span>
                </div>
                {limit !== null ? (
                  <div
                    role="progressbar"
                    aria-label={label}
                    aria-valuemin={0}
                    aria-valuemax={limit}
                    aria-valuenow={Math.min(used, limit)}
                    aria-valuetext={`${used} of ${limit} used${atLimit ? ", limit reached" : ""}`}
                    className={styles.track}
                  >
                    <div
                      key={`${used}-${limit}`}
                      className={cn(
                        styles.fill,
                        atLimit ? "bg-amber-500" : "bg-primary",
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                ) : (
                  <div className={styles.track} />
                )}
              </div>
            </div>
          );
        })}
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
