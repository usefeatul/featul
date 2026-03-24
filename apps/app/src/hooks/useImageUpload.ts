import { getCommentImageUploadUrl } from "@/lib/comment-service";
import { useSignedImageUpload } from "./shared-image-upload";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
export { type UploadedImage } from "./shared-image-upload";

export function useImageUpload(postId: string) {
  return useSignedImageUpload({
    getUploadTarget: (file) =>
      getCommentImageUploadUrl(postId, file.name, file.type, file.size),
    onUploadSuccess: ({ file }) => {
      captureAnalyticsEvent(analyticsEvents.imageUploaded, {
        upload_target: "comment",
        post_id: postId,
        file_type: file.type || "unknown",
        file_size_bytes: file.size,
      });
    },
  });
}
