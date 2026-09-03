export const LOW_INTERACTION_THRESHOLD_DAYS = 5
export const LOW_INTERACTION_STATUS_KEY = "low-interaction"
/** Posts start with one auto-upvote, so this is "no extra likes". */
export const LOW_INTERACTION_MAX_UPVOTES = 1

export function isLowInteractionStatusFilter(value: string) {
  return value.trim().toLowerCase().replace(/-/g, "") === "lowinteraction"
}
