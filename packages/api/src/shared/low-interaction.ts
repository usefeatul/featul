export const LOW_INTERACTION_THRESHOLD_DAYS = 5
export const LOW_INTERACTION_STATUS_KEY = "low-traction"
/** Posts start with one auto-upvote, so this is "no extra likes". */
export const LOW_INTERACTION_MAX_UPVOTES = 1

export function isLowInteractionStatusFilter(value: string) {
  const key = value.trim().toLowerCase().replace(/-/g, "")
  return key === "lowtraction" || key === "lowinteraction"
}
