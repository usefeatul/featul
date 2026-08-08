import type { Editor } from "@tiptap/core";
import type { Range } from "@tiptap/core";
import type { SuggestionItem } from "@featul/editor";
import { AiIcon } from "@featul/ui/icons/ai";
import {
  Sparkles,
  FileText,
  Maximize2,
  Wand2,
  AlignLeft,
  ListOrdered,
} from "lucide-react";

export type AiPanelTab = "shipped" | "refine";

export type AiQuickAction = "format" | "improve" | "expand" | "summary";

type SlashAiHandlers = {
  onOpenPanel: (tab: AiPanelTab) => void;
  onQuickAction: (action: AiQuickAction) => void;
};

function runSlashCommand(
  editor: Editor,
  range: Range,
  callback: () => void,
) {
  editor.chain().focus().deleteRange(range).run();
  callback();
}

export function getChangelogAiSlashSuggestions(
  handlers: SlashAiHandlers,
): SuggestionItem[] {
  return [
    {
      title: "AI Assistant",
      description: "Open the AI writing sidebar.",
      searchTerms: ["ai", "assistant", "write", "help"],
      icon: AiIcon,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => handlers.onOpenPanel("shipped")),
    },
    {
      title: "Generate from feedback",
      description: "Draft a changelog from shipped roadmap items.",
      searchTerms: ["ai", "generate", "feedback", "shipped", "roadmap"],
      icon: Sparkles,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => handlers.onOpenPanel("shipped")),
    },
    {
      title: "Expand detail",
      description: "Add depth and examples to the current entry.",
      searchTerms: ["ai", "expand", "detail", "longer"],
      icon: Maximize2,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => {
          handlers.onOpenPanel("refine");
          handlers.onQuickAction("expand");
        }),
    },
    {
      title: "Improve writing",
      description: "Polish clarity and flow.",
      searchTerms: ["ai", "improve", "polish", "rewrite"],
      icon: Wand2,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => {
          handlers.onOpenPanel("refine");
          handlers.onQuickAction("improve");
        }),
    },
    {
      title: "Fix formatting",
      description: "Clean up headings, lists, and structure.",
      searchTerms: ["ai", "format", "markdown", "structure"],
      icon: AlignLeft,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => {
          handlers.onOpenPanel("refine");
          handlers.onQuickAction("format");
        }),
    },
    {
      title: "Write summary",
      description: "Generate the list preview line.",
      searchTerms: ["ai", "summary", "preview", "excerpt"],
      icon: ListOrdered,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => {
          handlers.onOpenPanel("refine");
          handlers.onQuickAction("summary");
        }),
    },
    {
      title: "Custom AI prompt",
      description: "Describe exactly what you want changed.",
      searchTerms: ["ai", "prompt", "custom", "ask"],
      icon: FileText,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => handlers.onOpenPanel("refine")),
    },
  ];
}
