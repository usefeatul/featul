export type StatusIndicatorStatus =
  | "operational"
  | "degraded"
  | "partial-outage"
  | "major-outage";

export interface StatusIndicatorProps {
  status?: StatusIndicatorStatus;
  pulse?: boolean;
  className?: string;
  srLabel?: string;
}

export const STATUS_COLORS: Record<StatusIndicatorStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  "partial-outage": "bg-orange-500",
  "major-outage": "bg-red-500",
};

export function colorForStatus(status: StatusIndicatorStatus) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.operational;
}