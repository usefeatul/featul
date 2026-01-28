import type { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper } from "@tiptap/react";
import { useCallback } from "react";
import { TwitterComp } from "./twitter-comp";
import { EditorNodeViewWrapper } from "../../components/shared/node-view-wrapper";

export const TwitterUploadView = ({ getPos, editor }: NodeViewProps) => {
  const onSubmit = useCallback(
    (url: string) => {
      if (url && typeof getPos === "function") {
        const pos = getPos();
        if (typeof pos === "number") {
          // Replace the twitterUpload node with an actual Twitter embed
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + 1 })
            .setTweet({ src: url })
            .run();
        }
      }
    },
    [getPos, editor]
  );

  const onCancel = useCallback(() => {
    if (typeof getPos === "function") {
      const pos = getPos();
      if (typeof pos === "number") {
        // Remove the placeholder node
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + 1 })
          .run();
      }
    }
  }, [getPos, editor]);

  return (
    <EditorNodeViewWrapper data-drag-handle>
      <TwitterComp onCancel={onCancel} onSubmit={onSubmit} />
    </EditorNodeViewWrapper>
  );
};
