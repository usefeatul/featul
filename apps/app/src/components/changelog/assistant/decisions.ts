export type TagDecision =
  | { kind: "accept"; names: string[] }
  | { kind: "decline" }
  | null;

export type TagRemovalDecision =
  | { kind: "remove"; names: string[] }
  | { kind: "removeAll" }
  | { kind: "ask" }
  | null;

const ACCEPT_RE =
  /^(?:yes|yeah|yep|sure|okay|ok|please|go ahead|do it|add them|add it|use them|use it)\b/i;
const DECLINE_RE =
  /^(?:no|nope|not now|leave it|skip|don(?:'|’)t|do not|none)\b/i;
const APPLY_RE = /\b(?:add|use|apply|select|choose)\b/i;
const REMOVE_RE = /\b(?:remove|delete|clear|untag)\b/i;
const REMOVE_ALL_RE =
  /\b(?:untagged|untag\s+(?:it|this|the\s+(?:entry|changelog))|remove\s+(?:all\s+)?tags|clear\s+(?:all\s+)?tags|no\s+tags|without\s+(?:any\s+)?tags)\b/i;
const AMBIGUOUS_REMOVE_RE =
  /\b(?:remove|delete|clear|untag)\s+(?:a|one|the)?\s*tags?\b/i;

export function getTagDecision(
  text: string,
  suggestedNames: string[],
): TagDecision {
  const value = text.trim();
  if (!value) return null;
  if (DECLINE_RE.test(value)) return { kind: "decline" };

  const lower = value.toLowerCase();
  const mentioned = suggestedNames.filter((name) =>
    lower.includes(name.toLowerCase()),
  );
  if (mentioned.length > 0 && (APPLY_RE.test(value) || ACCEPT_RE.test(value))) {
    return { kind: "accept", names: mentioned };
  }
  if (ACCEPT_RE.test(value)) {
    return { kind: "accept", names: suggestedNames };
  }
  return null;
}

export function getTagRemovalDecision(
  text: string,
  selectedNames: string[],
): TagRemovalDecision {
  const value = text.trim();
  if (!value) return null;

  const lower = value.toLowerCase();
  const mentioned = selectedNames.filter((name) =>
    lower.includes(name.toLowerCase()),
  );

  if (REMOVE_RE.test(value) && mentioned.length > 0) {
    return { kind: "remove", names: mentioned };
  }
  if (REMOVE_ALL_RE.test(value)) return { kind: "removeAll" };
  if (AMBIGUOUS_REMOVE_RE.test(value)) return { kind: "ask" };

  return null;
}

const TAG_SIGNALS: Record<string, string[]> = {
  bug: [
    "bug",
    "fix",
    "error",
    "issue",
    "broken",
    "failure",
    "crash",
    "incorrect",
    "validation",
    "stability",
  ],
  design: ["design", "ui", "ux", "layout", "visual", "style"],
  feature: ["feature", "new", "launch", "introduce", "capability"],
  performance: ["performance", "speed", "faster", "latency", "slow"],
  security: ["security", "secure", "auth", "permission", "privacy"],
  support: ["support", "help", "documentation", "docs"],
  mobile: ["mobile", "ios", "android", "responsive"],
  api: ["api", "endpoint", "webhook", "integration"],
};

function normalizedTagName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function getFallbackTagSuggestions(
  changelogText: string,
  availableNames: string[],
) {
  const haystack = changelogText.toLowerCase();
  const words = new Set(haystack.match(/[a-z0-9]+/g) ?? []);
  const hasSignal = (word: string) =>
    words.has(word) ||
    words.has(`${word}s`) ||
    words.has(`${word}es`) ||
    words.has(`${word}ed`) ||
    words.has(`${word}ing`);

  return availableNames
    .filter((name) => {
      const normalized = normalizedTagName(name);
      const key = Object.keys(TAG_SIGNALS).find(
        (signal) => normalized === signal || normalized === `${signal}s`,
      );
      return key ? TAG_SIGNALS[key]!.some(hasSignal) : false;
    })
    .slice(0, 3);
}
