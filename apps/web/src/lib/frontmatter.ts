import { parse } from "yaml";

/** Parse repository Markdown using YAML's safe core schema. */
export default function frontmatter(source: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {}, content: source };
  const data: unknown = parse(match[1]!, { maxAliasCount: 50 });
  if (data !== null && (typeof data !== "object" || Array.isArray(data)))
    throw new Error("Markdown frontmatter must be a mapping");
  return {
    data: (data || {}) as Record<string, unknown>,
    content: source.slice(match[0].length),
  };
}
