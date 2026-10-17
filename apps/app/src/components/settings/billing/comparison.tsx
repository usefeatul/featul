"use client";

import { useId } from "react";
import Counter from "./counter";
import styles from "./plans.module.css";
import { getPlanLimits } from "@featul/api/shared/plan";
import { CheckIcon } from "@/components/global/icons";
import type { PlanKey } from "@/lib/plan";
import { PLAN_ORDER, getPlan, type BillingCycle } from "./data";

export const comparison = [
  {
    label: "Team members",
    value: (plan: PlanKey) => getPlanLimits(plan).maxMembers ?? "Unlimited",
  },
  {
    label: "Feedback boards",
    value: (plan: PlanKey) =>
      getPlanLimits(plan).maxNonSystemBoards ?? "Unlimited",
  },
  {
    label: "Changelog entries",
    value: (plan: PlanKey) =>
      getPlanLimits(plan).maxChangelogEntries ?? "Unlimited",
  },
  {
    label: "Feedback tags",
    value: (plan: PlanKey) => getPlanLimits(plan).maxTags ?? "Unlimited",
  },
  {
    label: "Custom domain & branding",
    value: (plan: PlanKey) => getPlanLimits(plan).allowBranding,
  },
  {
    label: "Remove featul attribution",
    value: (plan: PlanKey) => getPlanLimits(plan).allowHidePoweredBy,
  },
  {
    label: "Slack & Discord alerts",
    value: (plan: PlanKey) => getPlanLimits(plan).allowIntegrations,
  },
];

type Props = {
  selected: PlanKey;
  onSelect: (plan: PlanKey) => void;
  currentPlan: PlanKey;
  billingCycle: BillingCycle;
};

export default function Comparison({
  selected,
  onSelect,
  currentPlan,
  billingCycle,
}: Props) {
  const groupId = useId();
  return (
    <table className={styles.comparison}>
      <caption className="sr-only">
        Select a plan and compare features and limits
      </caption>
      <colgroup>
        <col className="w-[31%]" />
        {PLAN_ORDER.map((key) => (
          <col key={key} className="w-[23%]" />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="align-bottom text-left">
            <span className="text-xs font-normal text-muted-foreground">
              What’s included
            </span>
          </th>
          {PLAN_ORDER.map((key) => {
            const plan = getPlan(key);
            const amount =
              billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <th
                key={key}
                scope="col"
                data-selected={selected === key}
                className="relative p-0! align-top font-normal"
              >
                <label className={styles.option}>
                  <input
                    type="radio"
                    name={groupId}
                    value={key}
                    checked={selected === key}
                    onChange={() => onSelect(key)}
                    className="sr-only"
                    aria-label={`${plan.label}, £${amount} ${key === "free" ? "forever" : billingCycle === "yearly" ? "per year" : "per month"}${currentPlan === key ? ", current plan" : ""}`}
                  />
                  <span aria-hidden className={styles.selection}>
                    {selected === key ? <CheckIcon className="size-3" /> : null}
                  </span>
                  <span className="mt-3 block text-xs font-medium sm:text-sm">
                    <span className="sm:hidden">
                      {key === "professional" ? "Pro" : plan.label}
                    </span>
                    <span className="hidden sm:inline">{plan.label}</span>
                  </span>
                  <span className="mt-3 block whitespace-nowrap text-xl font-semibold tracking-tight sm:text-3xl">
                    <span className="mr-0.5 text-sm font-normal text-muted-foreground sm:text-lg">
                      £
                    </span>
                    <Counter value={amount} />
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground sm:text-xs">
                    {key === "free"
                      ? "forever"
                      : billingCycle === "yearly"
                        ? "per year"
                        : "per month"}
                  </span>
                  <span className="mt-3 block min-h-4 text-[10px] text-muted-foreground sm:text-[11px]">
                    {currentPlan === key ? "Current plan" : plan.tagline}
                  </span>
                </label>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {comparison.map((row) => (
          <tr key={row.label}>
            <th
              scope="row"
              className="text-left font-normal text-muted-foreground"
            >
              {row.label}
            </th>
            {PLAN_ORDER.map((key) => {
              const value = row.value(key);
              return (
                <td
                  key={key}
                  data-selected={selected === key}
                  className="text-center tabular-nums"
                >
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
                        <span aria-hidden className="text-muted-foreground/50">
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
  );
}
