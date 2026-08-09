import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  IMAGE_UPLOAD_CONTENT_TYPES,
  POST_IMAGE_UPLOAD_MAX_BYTES,
} from "@featul/api/upload-policy";

export const ALLOWED_IMAGE_TYPES: string[] = [...IMAGE_UPLOAD_CONTENT_TYPES];
export const MAX_IMAGE_SIZE = POST_IMAGE_UPLOAD_MAX_BYTES;

export interface UploadedImage {
  url: string;
  name: string;
  type: string;
}

type UploadTarget = {
  uploadUrl: string;
  publicUrl: string;
};

type UseSignedImageUploadOptions = {
  getUploadTarget: (file: File) => Promise<UploadTarget>;
  getPreUploadError?: (file: File) => string | null;
  onUploadSuccess?: (context: {
    file: File;
    publicUrl: string;
    uploadUrl: string;
  }) => void;
  loadingMessage?: string;
  successMessage?: string;
  defaultErrorMessage?: string;
};

export function getImageUploadValidationError(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported file type. Please use PNG, JPEG, WebP, or GIF.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image too large. Maximum size is 5MB.";
  }

  return null;
}

async function uploadFileToSignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
}

export function useSignedImageUpload({
  getUploadTarget,
  getPreUploadError,
  onUploadSuccess,
  loadingMessage = "Uploading image...",
  successMessage = "Image uploaded",
  defaultErrorMessage = "Failed to upload image",
}: UseSignedImageUploadOptions) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null,
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    const preUploadError = getPreUploadError?.(file);
    if (preUploadError) {
      toast.error(preUploadError);
      return;
    }

    const validationError = getImageUploadValidationError(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading(loadingMessage);

    try {
      const { uploadUrl, publicUrl } = await getUploadTarget(file);
      await uploadFileToSignedUrl(uploadUrl, file);

      setUploadedImage({
        url: publicUrl,
        name: file.name,
        type: file.type,
      });
      try {
        onUploadSuccess?.({ file, publicUrl, uploadUrl });
      } catch (analyticsError) {
        console.error("Failed to track uploaded image:", analyticsError);
      }
      toast.success(successMessage, { id: toastId });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : defaultErrorMessage;
      toast.error(message, { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleImageUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  return {
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleImageUpload,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  };
}
