/** Lowercases input and turns whitespace into hyphens. */
export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
}


