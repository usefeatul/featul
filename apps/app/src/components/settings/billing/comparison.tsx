"use client";

import type { ReactNode } from "react";
import {
  DitherGradient,
  type DitherGradientProps,
} from "@featul/ui/components/gradient";
import Counter from "./counter";
import styles from "./plans.module.css";
import { getPlanLimits } from "@featul/api/shared/plan";
import {
  AccountIcon,
  BoardIcon,
  CheckIcon,
  CollectIcon,
  EditIcon,
  TagIcon,
  DocsIcon,
  ExportIcon,
  DomainIcon,
  AppearanceIcon,
  IntegrationIcon,
  LockIcon,
  ShieldIcon,
  LikeIcon,
  Copy,
  PanelIcon,
  RoadmapIcon,
} from "@/components/global/icons";
import type { PlanKey } from "@/lib/plan";
import { PLAN_ORDER, getPlan, type BillingCycle } from "./data";

const planPattern: Record<PlanKey, DitherGradientProps["from"]> = {
  free: [110, 114, 122],
  starter: "blue",
  professional: "orange",
};

export const comparison = [
  {
    label: "Team members",
    icon: AccountIcon,
    value: (plan: PlanKey) => getPlanLimits(plan).maxMembers ?? "Unlimited",
  },
  {
    label: "Feedback boards",
    icon: BoardIcon,
    value: (plan: PlanKey) =>
      getPlanLimits(plan).maxNonSystemBoards ?? "Unlimited",
  },
  {
    label: "Monthly feedback posts",
    icon: CollectIcon,
    value: (plan: PlanKey) =>
      getPlanLimits(plan).monthlyPostLimit ?? "Unlimited",
  },
  {
    label: "Changelog entries",
    icon: EditIcon,
    value: (plan: PlanKey) =>
      getPlanLimits(plan).maxChangelogEntries ?? "Unlimited",
  },
  {
    label: "Feedback tags",
    icon: TagIcon,
    value: (plan: PlanKey) => getPlanLimits(plan).maxTags ?? "Unlimited",
  },
  {
    label: "Changelog tags",
    icon: TagIcon,
    value: (plan: PlanKey) =>
      getPlanLimits(plan).maxChangelogTags ?? "Unlimited",
  },
  // These capabilities are controlled by board settings and member permissions,
  // not by subscription tier (see the board, post, comment, and widget routers).
  {
    label: "Private boards",
    icon: LockIcon,
    value: () => true,
  },
  {
    label: "Anonymous posting",
    icon: AccountIcon,
    value: () => true,
  },
  {
    label: "Hide public member identities",
    icon: ShieldIcon,
    value: () => true,
  },
  {
    label: "Post & comment moderation",
    icon: ShieldIcon,
    value: () => true,
  },
  {
    label: "Voting & comments",
    icon: LikeIcon,
    value: () => true,
  },
  {
    label: "Internal team comments",
    icon: CollectIcon,
    value: () => true,
  },
  {
    label: "Merge duplicate posts",
    icon: Copy,
    value: () => true,
  },
  {
    label: "Public roadmap",
    icon: RoadmapIcon,
    value: () => true,
  },
  {
    label: "In-app feedback widget",
    icon: PanelIcon,
    value: () => true,
  },
  {
    label: "File attachments",
    icon: DocsIcon,
    value: (plan: PlanKey) => getPlanLimits(plan).allowAttachments,
  },
  {
    label: "CSV import & export",
    icon: ExportIcon,
    value: () => true,
  },
  {
    label: "Custom domain",
    icon: DomainIcon,
    value: (plan: PlanKey) => getPlanLimits(plan).allowBranding,
  },
  {
    label: "Branding controls",
    icon: AppearanceIcon,
    value: (plan: PlanKey) => getPlanLimits(plan).allowBranding,
  },
  {
    label: "Remove featul attribution",
    icon: AppearanceIcon,
    value: (plan: PlanKey) => getPlanLimits(plan).allowHidePoweredBy,
  },
  {
    label: "Integrations (Slack & Discord)",
    icon: IntegrationIcon,
    value: (plan: PlanKey) => getPlanLimits(plan).allowIntegrations,
  },
];

type Props = {
  currentPlan: PlanKey;
  billingCycle: BillingCycle;
  renderAction: (plan: PlanKey) => ReactNode;
};

export default function Comparison({
  currentPlan,
  billingCycle,
  renderAction,
}: Props) {
  return (
    <div className="pb-5">
      <div className="grid gap-3 px-5 sm:grid-cols-3 sm:px-7">
        {PLAN_ORDER.map((key) => {
          const plan = getPlan(key);
          const amount =
            billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <section
              key={key}
              className={styles.plan}
              aria-label={`${plan.label} plan`}
            >
              <DitherGradient
                from={planPattern[key]}
                to="transparent"
                direction="down"
                cell={3}
                bloom="low"
                opacity={0.45}
                className={styles.pattern}
              />
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex min-h-5 items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{plan.label}</h3>
                  {currentPlan === key ? (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {plan.tagline}
                </p>
                <div className="mb-5 mt-5">
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-[2rem] font-semibold leading-none tracking-tight">
                      {key === "free" ? (
                        "Free"
                      ) : (
                        <>
                          <span className="text-xl">£</span>
                          <Counter value={amount} />
                        </>
                      )}
                    </span>
                    {key !== "free" ? (
                      <span className="text-xs text-muted-foreground">
                        / {billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {key === "free"
                      ? "No subscription needed"
                      : billingCycle === "yearly"
                        ? `Save £${plan.monthlyPrice * 12 - plan.yearlyPrice} per year`
                        : "Billed monthly"}
                  </p>
                </div>
                <div className="mt-auto">{renderAction(key)}</div>
              </div>
            </section>
          );
        })}
      </div>
      <div
        className={`mt-6 overflow-x-auto ${styles.scroll}`}
        tabIndex={0}
        role="region"
        aria-label="Plan feature comparison"
      >
        <table className={styles.comparison}>
          <caption className="sr-only">
            Features and limits included in each plan
          </caption>
          <colgroup>
            <col className="w-[40%]" />
            {PLAN_ORDER.map((key) => (
              <col key={key} className="w-[20%]" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="text-left font-medium">
                <span className="inline-flex items-center gap-2">
                  <BoardIcon
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                  Compare plans
                </span>
              </th>
              {PLAN_ORDER.map((key) => (
                <th key={key} scope="col" className="text-center font-medium">
                  {getPlan(key).label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className="text-left font-normal text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <row.icon
                      aria-hidden
                      className="size-3.5 shrink-0 text-muted-foreground"
                    />
                    <span>{row.label}</span>
                  </span>
                </th>
                {PLAN_ORDER.map((key) => {
                  const value = row.value(key);
                  return (
                    <td key={key} className="text-center tabular-nums">
                      {typeof value === "boolean" ? (
                        value ? (
                          <>
                            <CheckIcon
                              aria-hidden
                              className="mx-auto size-3.5 text-foreground"
                            />
                            <span className="sr-only">Included</span>
                          </>
                        ) : (
                          <>
                            <span
                              aria-hidden
                              className="text-muted-foreground/50"
                            >
                              —
                            </span>
                            <span className="sr-only">Not included</span>
                          </>
                        )
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
