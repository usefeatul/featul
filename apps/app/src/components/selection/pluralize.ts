export function pluralizeItemLabel(
  label: string,
  count: number,
  pluralLabel?: string,
) {
  if (count === 1) return label;
  return pluralLabel ?? `${label}s`;
}
