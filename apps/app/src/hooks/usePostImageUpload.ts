import { getPostImageUploadUrl } from "@/lib/post-service";
import { useSignedImageUpload } from "./shared-image-upload";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";

export {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type UploadedImage,
} from "./shared-image-upload";

export function usePostImageUpload(workspaceSlug: string, boardSlug?: string) {
  return useSignedImageUpload({
    getPreUploadError: () => {
      if (!boardSlug) {
        return "Select a board before uploading an image.";
      }

      return null;
    },
    getUploadTarget: (file) =>
      getPostImageUploadUrl(
        workspaceSlug,
        file.name,
        file.type,
        file.size,
        boardSlug as string,
      ),
    onUploadSuccess: ({ file }) => {
      captureAnalyticsEvent(analyticsEvents.imageUploaded, {
        upload_target: "post",
        workspace_slug: workspaceSlug,
        board_slug: boardSlug || null,
        file_type: file.type || "unknown",
        file_size_bytes: file.size,
      });
    },
  });
}
