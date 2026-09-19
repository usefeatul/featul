export type PostContentSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string }

const DOMAIN_PATTERN =
  String.raw`(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}`

const POST_URL_PATTERN = new RegExp(
  String.raw`(?<![@\w.-])(?:(?:https?:\/\/|www\.)[^\s<>"']+|${DOMAIN_PATTERN}(?::\d{2,5})?(?:[/?#][^\s<>"']*)?)`,
  "gi"
)

const CLOSING_PAIRS = {
  ")": "(",
  "]": "[",
  "}": "{",
} as const

function countCharacter(value: string, character: string) {
  return [...value].filter((item) => item === character).length
}

function trimTrailingPunctuation(value: string) {
  let link = value
  let trailing = ""

  while (link) {
    const finalCharacter = link.at(-1)
    if (!finalCharacter) break

    if (/[.,!?;:]/.test(finalCharacter)) {
      trailing = finalCharacter + trailing
      link = link.slice(0, -1)
      continue
    }

    if (finalCharacter in CLOSING_PAIRS) {
      const openingCharacter =
        CLOSING_PAIRS[finalCharacter as keyof typeof CLOSING_PAIRS]
      if (
        countCharacter(link, finalCharacter) >
        countCharacter(link, openingCharacter)
      ) {
        trailing = finalCharacter + trailing
        link = link.slice(0, -1)
        continue
      }
    }

    break
  }

  return { link, trailing }
}

export function getSafePostHref(value: string) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) {
    return null
  }

  const candidate = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`

  try {
    const url = new URL(candidate)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null
  } catch {
    return null
  }
}

export function parsePostContentLinks(content: string): PostContentSegment[] {
  const segments: PostContentSegment[] = []
  let cursor = 0

  POST_URL_PATTERN.lastIndex = 0

  for (const match of content.matchAll(POST_URL_PATTERN)) {
    const matchIndex = match.index
    const rawValue = match[0]
    const { link, trailing } = trimTrailingPunctuation(rawValue)
    const href = getSafePostHref(link)

    if (matchIndex > cursor) {
      segments.push({ type: "text", value: content.slice(cursor, matchIndex) })
    }

    if (href) {
      segments.push({ type: "link", value: link, href })
      if (trailing) {
        segments.push({ type: "text", value: trailing })
      }
    } else {
      segments.push({ type: "text", value: rawValue })
    }

    cursor = matchIndex + rawValue.length
  }

  if (cursor < content.length) {
    segments.push({ type: "text", value: content.slice(cursor) })
  }

  return segments.length > 0
    ? segments
    : [{ type: "text", value: content }]
}
