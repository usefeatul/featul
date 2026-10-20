import { mergeAttributes } from "@tiptap/core";
import CodeBlockLowlight, { type CodeBlockLowlightOptions } from "@tiptap/extension-code-block-lowlight";
import type { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { lowlight } from "../../lib/lowlight";

const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  html: "HTML",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  markdown: "Markdown",
  md: "Markdown",
  python: "Python",
  py: "Python",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML",
};

/** Header label for the reading-view frame (styles/editor.css reads it from data-language). */
function languageLabel(language: string | null | undefined) {
  if (!language) return "Code";
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language.charAt(0).toUpperCase() + language.slice(1);
}

function codeBlockSpec(
  node: ProseMirrorNode,
  options: CodeBlockLowlightOptions,
  HTMLAttributes: Record<string, unknown>,
  children: DOMOutputSpec[] | [0],
): DOMOutputSpec {
  return [
    "pre",
    mergeAttributes(options.HTMLAttributes, HTMLAttributes, { "data-language": languageLabel(node.attrs.language) }),
    [
      "code",
      { class: node.attrs.language ? options.languageClassPrefix + node.attrs.language : null },
      ...children,
    ],
  ] as DOMOutputSpec;
}

/**
 * Code Block extension with syntax highlighting. The frame and both syntax palettes
 * (light and dark) are defined in styles/editor.css.
 */
export const CodeBlock = CodeBlockLowlight.extend({
  renderHTML({ node, HTMLAttributes }) {
    return codeBlockSpec(node, this.options, HTMLAttributes, [0]);
  },
}).configure({
  lowlight,
  HTMLAttributes: {
    class: "featul-code-block",
    spellcheck: "false",
  },
});

type HighlightNode = {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: HighlightNode[];
};

/** Same flattening as the lowlight plugin: one span per text run carrying every enclosing class. */
function highlightSpecs(nodes: HighlightNode[], classes: string[] = []): DOMOutputSpec[] {
  return nodes.flatMap((node) => {
    const nested = [...classes, ...(node.properties?.className ?? [])];
    if (node.children) return highlightSpecs(node.children, nested);
    const text = node.value ?? "";
    return nested.length ? [["span", { class: nested.join(" ") }, text] as DOMOutputSpec] : [text];
  });
}

/**
 * For static renders (EditorStaticContent): bakes the lowlight highlighting into the HTML,
 * since the plugin that decorates the live editor never runs there.
 */
export const StaticCodeBlock = CodeBlock.extend({
  renderHTML({ node, HTMLAttributes }) {
    const text = node.textContent;
    const language: string | null = node.attrs.language || this.options.defaultLanguage;
    const tree =
      language && lowlight.registered(language)
        ? lowlight.highlight(language, text)
        : lowlight.highlightAuto(text);

    return codeBlockSpec(node, this.options, HTMLAttributes, highlightSpecs(tree.children as HighlightNode[]));
  },
});
