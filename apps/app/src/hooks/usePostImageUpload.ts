import { getPostImageUploadUrl } from "@/lib/post-service";
import { useSignedImageUpload } from "./shared-image-upload";

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
  });
}
