export const REQUEST_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
] as const;

export function getRequestStatusLabel(status: string) {
  return (
    REQUEST_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}
