import { useState, useRef } from "react"
import { toast } from "sonner"
import { getCommentImageUploadUrl } from "@/lib/comment-service"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, UploadedImage } from "./usePostImageUpload"
export { type UploadedImage } from "./usePostImageUpload"

export function useImageUpload(postId: string) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
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
      const { uploadUrl, publicUrl } = await getCommentImageUploadUrl(
        postId,
        file.name,
        file.type
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
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image", { id: toastId })
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
