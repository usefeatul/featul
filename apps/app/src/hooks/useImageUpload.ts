import { getCommentImageUploadUrl, deleteCommentImageUpload } from "@/lib/comment/service";
import { useSignedUpload } from "./useSignedUpload";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
export { type UploadedImage } from "./useSignedUpload";

export function useImageUpload(postId: string) {
  return useSignedUpload({
    getUploadTarget: (file) =>
      getCommentImageUploadUrl(postId, file.name, file.type, file.size),
    onDeleteUpload: deleteCommentImageUpload,
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
