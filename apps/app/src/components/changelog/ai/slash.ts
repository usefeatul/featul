import type { Editor } from "@tiptap/core";
import type { Range } from "@tiptap/core";
import type { SuggestionItem } from "@featul/editor";
import { AiIcon } from "@featul/ui/icons/ai";
import {
  Sparkles,
  Maximize2,
  Wand2,
  AlignLeft,
  CalendarDays,
  ClipboardCheck,
  Code2,
} from "lucide-react";

type SlashAiHandlers = {
  onOpenPanel: () => void;
  onStartPrompt: (
    prompt: string,
    options?: {
      attachFeedback?: boolean;
      attachThisWeek?: boolean;
      publishCheck?: boolean;
    },
  ) => void;
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
      description: "Open the changelog chat.",
      searchTerms: ["ai", "assistant", "write", "help", "chat"],
      icon: AiIcon,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () => handlers.onOpenPanel()),
    },
    {
      title: "Draft from feedback",
      description: "Chat a changelog from shipped roadmap items.",
      searchTerms: ["ai", "generate", "feedback", "shipped", "roadmap"],
      icon: Sparkles,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () =>
          handlers.onStartPrompt(
            "Write a changelog from the attached shipped feedback.",
            { attachFeedback: true },
          ),
        ),
    },
    {
      title: "Draft this week",
      description: "Use completed posts from the last 7 days.",
      searchTerms: ["ai", "week", "completed", "release"],
      icon: CalendarDays,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () =>
          handlers.onStartPrompt(
            "Draft this week's changelog from the attached completed posts.",
            { attachThisWeek: true },
          ),
        ),
    },
    {
      title: "Expand detail",
      description: "Ask AI to add depth and examples.",
      searchTerms: ["ai", "expand", "detail", "longer"],
      icon: Maximize2,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () =>
          handlers.onStartPrompt(
            "Expand this changelog with more useful detail, examples, and user benefits.",
          ),
        ),
    },
    {
      title: "Improve writing",
      description: "Ask AI to polish clarity and flow.",
      searchTerms: ["ai", "improve", "polish", "rewrite"],
      icon: Wand2,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () =>
          handlers.onStartPrompt(
            "Improve the writing: clearer, tighter, and more user-friendly.",
          ),
        ),
    },
    {
      title: "Make it technical",
      description: "Rewrite for a more technical audience.",
      searchTerms: ["ai", "technical", "api", "engineer"],
      icon: Code2,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () =>
          handlers.onStartPrompt(
            "Rewrite this for a more technical audience. Keep it concrete.",
          ),
        ),
    },
    {
      title: "Fix formatting",
      description: "Ask AI to clean up headings and lists.",
      searchTerms: ["ai", "format", "markdown", "structure"],
      icon: AlignLeft,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () =>
          handlers.onStartPrompt(
            "Fix formatting and structure. Keep the meaning the same.",
          ),
        ),
    },
    {
      title: "Publish check",
      description: "Review the draft before publishing.",
      searchTerms: ["ai", "publish", "review", "check"],
      icon: ClipboardCheck,
      command: ({ editor, range }) =>
        runSlashCommand(editor, range, () =>
          handlers.onStartPrompt(
            "Review this changelog for publish readiness. What should we fix?",
            { publishCheck: true },
          ),
        ),
    },
  ];
}
