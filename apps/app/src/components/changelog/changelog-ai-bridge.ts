import type { RefObject } from "react";
import type { FeedEditorRef } from "@/components/editor/editor";

export type ChangelogAiBridge = {
  workspaceSlug: string;
  title: string;
  editorRef: RefObject<FeedEditorRef | null>;
  setTitle: (value: string) => void;
  setSummary: (value: string) => void;
  setIsDirty: (value: boolean) => void;
};
