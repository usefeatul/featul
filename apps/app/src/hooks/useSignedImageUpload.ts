import { useCallback, useRef, useState, type ChangeEvent } from "react";
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
  onDeleteUpload?: (publicUrl: string) => Promise<void>;
  loadingMessage?: string;
  successMessage?: string;
  defaultErrorMessage?: string;
  maxFiles?: number;
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
  onDeleteUpload,
  loadingMessage = "Uploading image...",
  successMessage = "Image uploaded",
  defaultErrorMessage = "Failed to upload image",
  maxFiles = 1,
}: UseSignedImageUploadOptions) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<UploadedImage[]>([]);

  const setImages = useCallback((next: UploadedImage[]) => {
    imagesRef.current = next;
    setUploadedImages(next);
  }, []);

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

    if (imagesRef.current.length >= maxFiles) {
      toast.error(`You can add up to ${maxFiles} images.`);
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading(loadingMessage);

    try {
      const { uploadUrl, publicUrl } = await getUploadTarget(file);
      await uploadFileToSignedUrl(uploadUrl, file);

      const replaced =
        maxFiles === 1 ? imagesRef.current[0] : undefined;
      const nextImage: UploadedImage = {
        url: publicUrl,
        name: file.name,
        type: file.type,
      };
      setImages(
        maxFiles === 1 ? [nextImage] : [...imagesRef.current, nextImage],
      );
      if (replaced?.url && replaced.url !== publicUrl) {
        void onDeleteUpload?.(replaced.url).catch(() => undefined);
      }
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

  const handleImageFiles = async (files: File[]) => {
    const remaining = Math.max(0, maxFiles - imagesRef.current.length);
    const accepted = files.slice(0, remaining);
    if (files.length > accepted.length) {
      toast.error(`You can add up to ${maxFiles} images.`);
    }
    for (const file of accepted) {
      await handleImageUpload(file);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      void handleImageFiles(files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = useCallback(
    (index = 0) => {
      const removed = imagesRef.current[index];
      setImages(imagesRef.current.filter((_, itemIndex) => itemIndex !== index));
      if (removed?.url) {
        void onDeleteUpload?.(removed.url).catch(() => undefined);
      }
    },
    [onDeleteUpload, setImages],
  );

  const setUploadedImage = useCallback(
    (value: UploadedImage | null) => {
      setImages(value ? [value] : []);
    },
    [setImages],
  );

  const uploadedImage = uploadedImages[0] ?? null;

  return {
    uploadedImage,
    uploadedImages,
    uploadingImage,
    fileInputRef,
    maxFiles,
    setUploadedImage,
    setUploadedImages: setImages,
    handleImageUpload,
    handleImageFiles,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  };
}
