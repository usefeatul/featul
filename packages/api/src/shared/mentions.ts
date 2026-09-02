export type MentionableUser = {
  userId: string
  name: string
}

export type MentionMatch = {
  start: number
  end: number
  value: string
  name: string
}

export type ParsedMention = {
  userId: string
  name: string
}

const MENTION_BOUNDARY = "(?=$|\\s|[.,;:!?()\\[\\]{}])"

export function escapeMentionRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const name of names) {
    const trimmed = name.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(trimmed)
  }

  return unique.sort((left, right) => right.length - left.length)
}

/** Find `@Name` tokens that match known workspace members only. */
export function matchKnownMentions(
  text: string,
  names: string[],
): MentionMatch[] {
  if (!text || !text.includes("@")) return []

  const known = uniqueNames(names)
  if (known.length === 0) return []

  const pattern = new RegExp(
    `@(${known.map(escapeMentionRegExp).join("|")})${MENTION_BOUNDARY}`,
    "gi",
  )
  const matches: MentionMatch[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text))) {
    const value = match[0]
    const name = match[1] || ""
    if (!value || !name) continue
    matches.push({
      start: match.index,
      end: match.index + value.length,
      value,
      name,
    })
    if (value.length === 0) pattern.lastIndex += 1
  }

  return matches
}

/** Resolve typed or inserted `@Name` mentions to workspace members. Unknown names are ignored. */
export function parseMentionsFromText(
  text: string,
  mentionable: MentionableUser[],
): ParsedMention[] {
  const byName = new Map<string, MentionableUser>()
  for (const person of mentionable) {
    const name = person.name.trim()
    const userId = person.userId.trim()
    if (!name || !userId) continue
    const key = name.toLowerCase()
    if (!byName.has(key)) byName.set(key, { userId, name })
  }

  const matches = matchKnownMentions(
    text,
    [...byName.values()].map((person) => person.name),
  )
  const parsed: ParsedMention[] = []
  const seen = new Set<string>()

  for (const match of matches) {
    const person = byName.get(match.name.toLowerCase())
    if (!person || seen.has(person.userId)) continue
    seen.add(person.userId)
    parsed.push({ userId: person.userId, name: person.name })
  }

  return parsed
}
