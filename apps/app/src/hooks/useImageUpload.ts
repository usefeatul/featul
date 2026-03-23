import { getCommentImageUploadUrl } from "@/lib/comment-service";
import { useSignedImageUpload } from "./shared-image-upload";
export { type UploadedImage } from "./shared-image-upload";

export function useImageUpload(postId: string) {
  return useSignedImageUpload({
    getUploadTarget: (file) =>
      getCommentImageUploadUrl(postId, file.name, file.type, file.size),
  });
}
