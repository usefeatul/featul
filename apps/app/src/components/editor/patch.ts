import type { Editor } from "@featul/editor";
import type { ConversationResponse } from "@featul/api/ai/edits";
import { mapMarkdownDocument } from "./mapping";

// Markdown cannot represent every editor attribute. Compare the parsed baseline
// to the replacement, then splice only the changed ranges into the real document.
// Unaffected colors, image attributes, and other rich content stay in place.
export function applyEditorEdits(
  editor: Editor,
  edits: ConversationResponse["edits"],
): boolean {
  if (!editor.markdown) return false;
  let markdown = editor.getMarkdown();
  const ranges = edits
    .map(({ before, after }) => {
      const from = markdown.indexOf(before);
      return { from, to: from + before.length, before, after };
    })
    .sort((a, b) => b.from - a.from);
  if (
    ranges.some(
      (range, index) =>
        !range.before ||
        range.from < 0 ||
        markdown.indexOf(range.before, range.from + 1) !== -1 ||
        (index > 0 && range.to > ranges[index - 1]!.from),
    )
  )
    return false;

  try {
    const transaction = editor.state.tr;
    for (const range of ranges) {
      const baseline = editor.schema.nodeFromJSON(
        editor.markdown.parse(markdown),
      );
      const mapping = mapMarkdownDocument(baseline, transaction.doc, (node) =>
        editor.markdown!.serialize(node.toJSON()),
      );
      if (!mapping) return false;
      markdown =
        markdown.slice(0, range.from) + range.after + markdown.slice(range.to);
      const replacement = editor.schema.nodeFromJSON(
        editor.markdown.parse(markdown),
      );
      const start = baseline.content.findDiffStart(replacement.content);
      if (start === null) continue;
      const end = baseline.content.findDiffEnd(replacement.content)!;
      // ProseMirror's diff ends may precede the start for pure insertions/deletions.
      const overlap = start - Math.min(end.a, end.b);
      const oldEnd = overlap > 0 ? end.a + overlap : end.a;
      const newEnd = overlap > 0 ? end.b + overlap : end.b;
      const target = mapping.range(start, oldEnd);
      if (!target) return false;
      transaction.replace(
        target.from,
        target.to,
        replacement.slice(start, newEnd),
      );
    }
    editor.view.dispatch(transaction);
    return true;
  } catch {
    // No transaction is dispatched unless all edits can be mapped safely.
    return false;
  }
}
