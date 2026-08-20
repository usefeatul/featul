import type { NodeViewProps } from "@tiptap/core";
import { useCallback } from "react";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { ImageUploadComp } from "./image-upload-comp";
import { pendingUploads } from "./image-upload";
import { EditorNodeViewWrapper } from "../../components/shared/node-view-wrapper";

export const ImageUploadView = ({
  getPos,
  editor,
  node,
  extension,
}: NodeViewProps) => {
  // Get fileId from node attributes
  const fileId = node.attrs.fileId as string | null;
  const initialFile = fileId ? pendingUploads.get(fileId) : undefined;

  // Get extension options from storage
  const options = extension.storage.options;

  const onUpload = useCallback(
    (url: string) => {
      if (url && typeof getPos === "function") {
        const pos = getPos();
        if (typeof pos === "number") {
          // Clean up pending upload if it exists
          if (fileId) {
            pendingUploads.delete(fileId);
          }

          // Replace the imageUpload node with a figure (image with caption support)
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + 1 })
            .setFigure({ src: url, alt: "", caption: "" })
            .run();
        }
      }
    },
    [getPos, editor, fileId]
  );

  const onCancel = useCallback(() => {
    if (typeof getPos === "function") {
      const pos = getPos();
      if (typeof pos === "number") {
        // Clean up pending upload if it exists
        if (fileId) {
          pendingUploads.delete(fileId);
        }

        // Remove the placeholder node
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + 1 })
          .run();
      }
    }
  }, [getPos, editor, fileId]);

  // Only render if upload handler is configured
  if (!options.upload) {
    return (
      <EditorNodeViewWrapper>
        <div className={cn(overlayDialogClass, "flex flex-col gap-2")}>
          <div className="flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
            Image upload
          </div>
          <div className={cn(overlayInnerClass, "px-4 py-3")}>
            <p className="text-sm text-accent">
              Image upload is not configured. Please configure the ImageUpload
              extension with an upload handler.
            </p>
          </div>
        </div>
      </EditorNodeViewWrapper>
    );
  }

  return (
    <EditorNodeViewWrapper data-drag-handle>
      <ImageUploadComp
        fetchMedia={options.fetchMedia}
        initialFile={initialFile}
        media={options.media}
        onCancel={onCancel}
        onError={options.onError}
        onUpload={onUpload}
        upload={options.upload}
      />
    </EditorNodeViewWrapper>
  );
};
