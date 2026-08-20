import { getPostImageUploadUrl, deletePostImageUpload } from "@/lib/post/service";
import { useSignedImageUpload } from "./useSignedImageUpload";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
import { POST_MAX_IMAGES } from "@featul/api/upload-policy";

export {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type UploadedImage,
} from "./useSignedImageUpload";

export function usePostImageUpload(workspaceSlug: string, boardSlug?: string) {
  return useSignedImageUpload({
    maxFiles: POST_MAX_IMAGES,
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
    onDeleteUpload: deletePostImageUpload,
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
