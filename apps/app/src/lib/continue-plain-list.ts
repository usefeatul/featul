export type ContinuePlainListResult = {
  nextValue: string
  nextCaret: number
}

const ORDERED_LIST = /^(\s*)(\d+)\.\s(.*)$/
const BULLET_LIST = /^(\s*)([-*])\s(.*)$/

export function continuePlainList(
  value: string,
  selectionStart: number,
  selectionEnd: number
): ContinuePlainListResult | null {
  const caret = Math.max(0, Math.min(selectionStart, value.length))
  const lineStart = value.lastIndexOf("\n", caret - 1) + 1
  const newlineAt = value.indexOf("\n", caret)
  const lineEnd = newlineAt === -1 ? value.length : newlineAt
  const line = value.slice(lineStart, lineEnd)

  const ordered = line.match(ORDERED_LIST)
  const bullet = ordered ? null : line.match(BULLET_LIST)
  if (!ordered && !bullet) {
    return null
  }

  const indent = ordered?.[1] ?? bullet?.[1] ?? ""
  const rest = ordered?.[3] ?? bullet?.[3] ?? ""
  const prefixLength = line.length - rest.length

  if (rest.trim() === "") {
    const nextValue =
      value.slice(0, lineStart) + value.slice(lineStart + prefixLength)
    return { nextValue, nextCaret: lineStart }
  }

  const nextPrefix = ordered
    ? `${indent}${Number(ordered[2]) + 1}. `
    : `${indent}${bullet?.[2]} `

  const insert = `\n${nextPrefix}`
  const end = Math.max(caret, Math.min(selectionEnd, value.length))
  const nextValue = value.slice(0, caret) + insert + value.slice(end)

  return { nextValue, nextCaret: caret + insert.length }
}
