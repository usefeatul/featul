import type { TocItem } from "./toc"

// Spacing constants (in pixels)
export const TOC_ITEM_HEIGHT = 30 // py-1.5 + text height
export const TOC_INDENT_OFFSET = 12 // ml-3 = 0.75rem = 12px

export interface TocItemPosition {
  y: number
  pathOffset: number
}

export interface TocPathData {
  pathD: string
  pathLength: number
  itemPositions: TocItemPosition[]
}

/**
 * Builds an SVG path string for a zig-zag TOC border track.
 * The path follows item indentation levels, creating horizontal
 * segments when transitioning between h2 and h3 items.
 */
export function buildTocPath(items: TocItem[]): TocPathData {
  if (!items.length) {
    return { pathD: "", pathLength: 0, itemPositions: [] }
  }

  let d = ""
  let currentX = 0
  let currentY = 0
  let totalLength = 0
  const positions: TocItemPosition[] = []

  items.forEach((item, index) => {
    const isH3 = item.level === 3
    const targetX = isH3 ? TOC_INDENT_OFFSET : 0
    const itemCenterY = index * TOC_ITEM_HEIGHT + TOC_ITEM_HEIGHT / 2

    // Store initial position info for this item
    positions.push({ y: itemCenterY, pathOffset: totalLength })

    if (index === 0) {
      // Start at first item
      d = `M ${targetX} 0`
      currentX = targetX
      currentY = 0
    }

    // If we need to move horizontally (indent change)
    if (currentX !== targetX) {
      // Move down to the transition point (between items)
      const transitionY = index * TOC_ITEM_HEIGHT
      d += ` L ${currentX} ${transitionY}`
      totalLength += Math.abs(transitionY - currentY)
      currentY = transitionY

      // Move horizontally
      d += ` L ${targetX} ${transitionY}`
      totalLength += Math.abs(targetX - currentX)
      currentX = targetX
    }

    // Move down to end of this item
    const itemEndY = (index + 1) * TOC_ITEM_HEIGHT
    d += ` L ${currentX} ${itemEndY}`
    totalLength += Math.abs(itemEndY - currentY)
    currentY = itemEndY

    // Update position with final path offset at item center
    const pos = positions[index]
    if (pos) {
      pos.pathOffset = totalLength - TOC_ITEM_HEIGHT / 2
    }
  })

  return { pathD: d, pathLength: totalLength, itemPositions: positions }
}

/**
 * Calculates the progress value (0-1) for a given item index along the path.
 */
export function getProgressForIndex(
  activeIndex: number,
  itemPositions: TocItemPosition[],
  pathLength: number
): number {
  if (activeIndex < 0 || pathLength <= 0) return 0

  const position = itemPositions[activeIndex]
  if (!position) return 0

  return position.pathOffset / pathLength
}

/**
 * Calculates the total height of the TOC based on item count.
 */
export function getTocHeight(itemCount: number): number {
  return itemCount * TOC_ITEM_HEIGHT
}

