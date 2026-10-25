import type { CSSProperties, ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";
import { getPlanFill, type PlanKey } from "@/lib/plan";

/** Solid plan chip: the plan's fill as a lit gradient with white text, matching the raised buttons. */
export default function PlanBadge({
  plan,
  children,
  className,
}: {
  plan: PlanKey | string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      style={{ "--plan": getPlanFill(plan) } as CSSProperties}
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border border-[color-mix(in_oklab,var(--plan),black_12%)] bg-[var(--plan)] bg-linear-to-b from-[var(--plan)] to-[color-mix(in_oklab,var(--plan),black_18%)] px-1.5 py-[3px] text-[11px] font-medium leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.18)] [corner-shape:squircle] [text-shadow:0_1px_0_rgba(0,0,0,0.15)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
