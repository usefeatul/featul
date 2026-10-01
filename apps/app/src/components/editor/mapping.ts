import type { Editor } from "@featul/editor";

type Node = Editor["state"]["doc"];
type Segment = { from: number; to: number; target: number };

function sameLayout(left: Node, right: Node): boolean {
  if (
    left.type !== right.type ||
    left.nodeSize !== right.nodeSize ||
    left.textContent !== right.textContent
  )
    return false;
  // Extra marks may split inline text runs, but do not change their positions.
  if (left.inlineContent && right.inlineContent) return true;
  if (left.childCount !== right.childCount) return false;
  for (let index = 0; index < left.childCount; index++) {
    if (!sameLayout(left.child(index), right.child(index))) return false;
  }
  return true;
}

/** Map parsed Markdown positions to the rich document, retaining omitted nodes. */
export function mapMarkdownDocument(
  baseline: Node,
  document: Node,
  serialize: (node: Node) => string,
) {
  const segments: Segment[] = [];
  const omitted: Array<{ from: number; to: number }> = [];

  function visit(
    left: Node,
    right: Node,
    from: number,
    target: number,
  ): boolean {
    if (sameLayout(left, right)) {
      segments.push({ from, to: from + left.nodeSize, target });
      return true;
    }
    if (left.type !== right.type || left.isLeaf || left.inlineContent)
      return false;

    // Opening and closing tokens keep nested lists and blockquotes addressable.
    segments.push({ from, to: from + 1, target });
    let leftIndex = 0;
    let leftOffset = from + 1;
    let rightOffset = target + 1;
    for (let index = 0; index < right.childCount; index++) {
      const child = right.child(index);
      const leftChild =
        leftIndex < left.childCount ? left.child(leftIndex) : null;
      const segmentCount = segments.length;
      const omittedCount = omitted.length;
      if (leftChild && visit(leftChild, child, leftOffset, rightOffset)) {
        leftOffset += leftChild.nodeSize;
        leftIndex++;
      } else {
        segments.length = segmentCount;
        omitted.length = omittedCount;
        if (serialize(child).trim()) return false;
        omitted.push({ from: rightOffset, to: rightOffset + child.nodeSize });
      }
      rightOffset += child.nodeSize;
    }
    if (leftIndex !== left.childCount) return false;
    segments.push({
      from: leftOffset,
      to: leftOffset + 1,
      target: rightOffset,
    });
    return true;
  }

  // The document has no opening token; its child positions start at zero.
  if (!visit(baseline, document, -1, -1)) return null;

  const position = (value: number, bias: "left" | "right") => {
    const matches = segments.filter(
      (segment) => value >= segment.from && value <= segment.to,
    );
    const positions = matches.map(
      (segment) => segment.target + value - segment.from,
    );
    if (!positions.length) return null;
    return bias === "left" ? Math.min(...positions) : Math.max(...positions);
  };

  return {
    range(from: number, to: number) {
      // An insertion belongs after the preceding visible content and before any
      // omitted trailing nodes. Replacements exclude omitted nodes at either end.
      const start = position(from, from === to ? "left" : "right");
      const end = from === to ? start : position(to, "left");
      if (start === null || end === null || start > end) return null;
      if (omitted.some((node) => node.from < end && node.to > start))
        return null;
      return { from: start, to: end };
    },
  };
}
