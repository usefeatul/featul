export function getFilterIslandLabel(count: number, expanded: boolean) {
  if (expanded) {
    return "Collapse active filters";
  }

  return `${count} active filter${count === 1 ? "" : "s"}`;
}

export function getFilterPreviewSuffix(count: number) {
  return count > 2 ? ` +${count - 2}` : "";
}
