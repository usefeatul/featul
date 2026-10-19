/** Next hands dynamic segments over still percent-encoded; slugs are stored decoded. */
export function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
