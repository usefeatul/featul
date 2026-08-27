/** Aria label for the filter island. Expanded vs collapsed wording. */
export function getFilterIslandLabel(count: number, expanded: boolean) {
  if (expanded) {
    return "Collapse active filters";
  }

  return `${count} active filter${count === 1 ? "" : "s"}`;
}

/** Overflow suffix after two chips, e.g. ` +3`. Empty when count ≤ 2. */
export function getFilterPreviewSuffix(count: number) {
  return count > 2 ? ` +${count - 2}` : "";
}
