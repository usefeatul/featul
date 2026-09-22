/** Continues markdown-style lists in plain textareas. */

export type ContinuePlainListResult = {
  nextValue: string
  nextCaret: number
}

const ORDERED_LIST = /^(\s*)(\d+)\.\s(.*)$/
const BULLET_LIST = /^(\s*)([-*])\s(.*)$/
const LIST_LINE = /^(\s*)(?:\d+\.|[-*])\s/
const INDENT = "  "

function lineBounds(value: string, caret: number) {
  const lineStart = value.lastIndexOf("\n", caret - 1) + 1
  const newlineAt = value.indexOf("\n", caret)
  const lineEnd = newlineAt === -1 ? value.length : newlineAt
  return { lineStart, lineEnd, line: value.slice(lineStart, lineEnd) }
}

/** Enter: next list item, or drop an empty item prefix. */
export function continuePlainList(
  value: string,
  selectionStart: number,
  selectionEnd: number
): ContinuePlainListResult | null {
  const caret = Math.max(0, Math.min(selectionStart, value.length))
  const { lineStart, line } = lineBounds(value, caret)

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

/** Tab/Shift-Tab indent for list lines; null when not in a list. */
export function indentPlainList(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  direction: "in" | "out"
): ContinuePlainListResult | null {
  const start = Math.max(0, Math.min(selectionStart, selectionEnd, value.length))
  const end = Math.min(Math.max(selectionStart, selectionEnd), value.length)
  const rangeStart = value.lastIndexOf("\n", start - 1) + 1
  const rangeEndNewline = value.indexOf("\n", Math.max(end - (end > rangeStart ? 1 : 0), rangeStart))
  const rangeEnd = rangeEndNewline === -1 ? value.length : rangeEndNewline
  const block = value.slice(rangeStart, rangeEnd)
  const lines = block.split("\n")
  const current = lineBounds(value, start).line
  const inList = lines.some((line) => LIST_LINE.test(line)) || LIST_LINE.test(current)

  if (!inList) {
    return null
  }

  let caretDelta = 0
  const nextLines = lines.map((line, index) => {
    if (direction === "in") {
      if (index === 0) {
        caretDelta += INDENT.length
      }
      return `${INDENT}${line}`
    }

    const match = line.match(/^ {1,2}/)
    if (!match) {
      return line
    }
    const removed = match[0].length
    if (index === 0) {
      caretDelta -= Math.min(removed, Math.max(0, start - rangeStart))
    }
    return line.slice(removed)
  })

  const nextBlock = nextLines.join("\n")
  if (nextBlock === block) {
    return null
  }

  return {
    nextValue: value.slice(0, rangeStart) + nextBlock + value.slice(rangeEnd),
    nextCaret: Math.max(rangeStart, start + caretDelta),
  }
}
