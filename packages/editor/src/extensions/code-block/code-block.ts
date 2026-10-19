import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "../../lib/lowlight";

/**
 * Code Block extension with syntax highlighting. The frame and both syntax palettes
 * (light and dark) are defined in styles/editor.css.
 */
export const CodeBlock = CodeBlockLowlight.configure({
  lowlight,
  HTMLAttributes: {
    class: "featul-code-block",
    spellcheck: "false",
  },
});
