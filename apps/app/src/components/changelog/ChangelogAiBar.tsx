"use client";

import { useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize";
import { AiIcon } from "@featul/ui/icons/ai";
import { cn } from "@featul/ui/lib/utils";
import { client } from "@featul/api/client";
import type { FeedEditorRef } from "@/components/editor/editor";

type AiAction = "prompt" | "format" | "improve" | "summary";

interface ChangelogAiBarProps {
  workspaceSlug: string;
  title: string;
  summary: string;
  setTitle: (value: string) => void;
  setSummary: (value: string) => void;
  editorRef: RefObject<FeedEditorRef>;
  setIsDirty: (value: boolean) => void;
}

export function ChangelogAiBar({
  workspaceSlug,
  title,
  setTitle,
  setSummary,
  editorRef,
  setIsDirty,
}: ChangelogAiBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runAction = async (action: AiAction) => {
    if (isLoading) return;

    if (action === "prompt" && !prompt.trim()) {
      toast.error("Enter a prompt to generate content");
      return;
    }

    if (action !== "prompt") {
      const markdown = editorRef.current?.getMarkdown();
      if (!markdown || !markdown.trim()) {
        toast.error("Add some content before using this action");
        return;
      }
    }

    setIsLoading(true);
    try {
      const contentMarkdown = action === "prompt" ? undefined : editorRef.current?.getMarkdown();
      const res = await client.changelog.aiAssist.$post({
        slug: workspaceSlug,
        action,
        prompt: action === "prompt" ? prompt.trim() : undefined,
        title: title.trim() || undefined,
        contentMarkdown: contentMarkdown?.trim() || undefined,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !("ok" in data) || !data.ok) {
        const msg = (data as { message?: string })?.message || "Failed to run AI assist";
        toast.error(msg);
        return;
      }

      if (data.title && typeof data.title === "string") {
        setTitle(data.title);
        setIsDirty(true);
      }

      if (data.contentMarkdown && typeof data.contentMarkdown === "string") {
        editorRef.current?.setContentFromMarkdown(data.contentMarkdown);
        setIsDirty(true);
      }

      if (data.summary && typeof data.summary === "string") {
        setSummary(data.summary);
        setIsDirty(true);
      }

      if (action === "prompt") {
        setPrompt("");
      }

      toast.success("AI changes applied");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to run AI assist";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-16 lg:bottom-6 z-40 pointer-events-none">
      <motion.div
        className="mx-auto w-full px-4 pointer-events-auto"
        initial={false}
        animate={{ maxWidth: isOpen ? 800 : 160 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className={cn(
            "border border-border bg-background shadow-2xl",
            isOpen ? "rounded-md" : "rounded-md"
          )}
        >
          {!isOpen ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors"
              onClick={() => setIsOpen(true)}
              aria-expanded="false"
            >
              <AiIcon className="size-4 text-primary" />
              <span className="flex-1 text-left font-medium">Ask AI</span>
            </button>
          ) : (
            <AnimatePresence initial={false}>
              <motion.div
                key="ai-panel"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="flex h-[600px] flex-col"
              >
                <div className="flex items-center justify-between p-4 pb-2">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <AiIcon className="size-4" />
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted" disabled>
                      History
                    </button>
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted" disabled>
                      New chat
                    </button>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                      aria-expanded="true"
                    >
                      Minimize
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-md bg-muted/50 text-foreground/50">
                    <AiIcon className="size-6" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-border/50 hover:bg-muted/50 hover:border-border transition-all text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => runAction("format")}
                      disabled={isLoading}
                    >
                      <span>Fix formatting</span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-border/50 hover:bg-muted/50 hover:border-border transition-all text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => runAction("improve")}
                      disabled={isLoading}
                    >
                      <span>Improve writing</span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-border/50 hover:bg-muted/50 hover:border-border transition-all text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => runAction("summary")}
                      disabled={isLoading}
                    >
                      <span>Add summary</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 pt-2">
                  <div className="relative">
                    <TextareaAutosize
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onEnterPress={() => runAction("prompt")}
                      minRows={1}
                      maxRows={5}
                      placeholder="How can I help you regarding this changelog?"
                      className={cn(
                        "w-full resize-none rounded-md border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50",
                        isLoading && "opacity-70"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-md hover:bg-muted"
                      onClick={() => runAction("prompt")}
                      disabled={isLoading || !prompt.trim()}
                      aria-label="Send prompt"
                    >
                      <AiIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ChangelogAiBar;
