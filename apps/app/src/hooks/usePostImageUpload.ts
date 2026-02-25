import { useState, useRef } from "react"
import { toast } from "sonner"
import { getPostImageUploadUrl } from "@/lib/post-service"
import { IMAGE_UPLOAD_CONTENT_TYPES, POST_IMAGE_UPLOAD_MAX_BYTES } from "@featul/api/upload-policy"

export const ALLOWED_IMAGE_TYPES: string[] = [...IMAGE_UPLOAD_CONTENT_TYPES]
export const MAX_IMAGE_SIZE = POST_IMAGE_UPLOAD_MAX_BYTES

export interface UploadedImage {
  url: string
  name: string
  type: string
}

export function usePostImageUpload(workspaceSlug: string, boardSlug?: string) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    if (!boardSlug) {
      toast.error("Select a board before uploading an image.")
      return
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Please use PNG, JPEG, WebP, or GIF.")
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image too large. Maximum size is 5MB.")
      return
    }

    setUploadingImage(true)
    const toastId = toast.loading("Uploading image...")

    try {
      const { uploadUrl, publicUrl } = await getPostImageUploadUrl(
        workspaceSlug,
        file.name,
        file.type,
        file.size,
        boardSlug
      )

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      setUploadedImage({
        url: publicUrl,
        name: file.name,
        type: file.type,
      })
      toast.success("Image uploaded", { id: toastId })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload image"
      toast.error(message, { id: toastId })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
  }

  return {
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  }
}
