import type { FC } from "react";
import PlannedIcon from "@featul/ui/icons/planned";
import ProgressIcon from "@featul/ui/icons/progress";
import ReviewIcon from "@featul/ui/icons/review";
import CompletedIcon from "@featul/ui/icons/completed";
import PendingIcon from "@featul/ui/icons/pending";
import ClosedIcon from "@featul/ui/icons/closed";
import type { DemoStatus } from "./data";

const ICONS: Record<DemoStatus, FC<{ className?: string }>> = {
  planned: PlannedIcon,
  progress: ProgressIcon,
  review: ReviewIcon,
  completed: CompletedIcon,
  pending: PendingIcon,
  closed: ClosedIcon,
};

export function DemoStatusIcon({
  status,
  className = "",
}: {
  status: DemoStatus;
  className?: string;
}) {
  const Icon = ICONS[status];
  return <Icon className={className} />;
}
