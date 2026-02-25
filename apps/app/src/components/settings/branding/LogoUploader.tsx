"use client"

import React from "react"
import Image from "next/image"
import { toast } from "sonner"
import { getLogoUploadUrl, saveBranding } from "../../../lib/branding-service"
import { setWorkspaceLogo } from "@/lib/branding-store"
import { BRANDING_UPLOAD_CONTENT_TYPES, BRANDING_LOGO_UPLOAD_MAX_BYTES } from "@featul/api/upload-policy"

type Props = {
  slug: string
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export default function LogoUploader({ slug, value = "", onChange, disabled = false }: Props) {
  const [preview, setPreview] = React.useState<string>(value || "")
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    setPreview(value || "")
  }, [value])

  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const pick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const onFile = async (file: File) => {
    if (disabled) {
      toast.error("You don’t have permission to change logo")
      return
    }
    if (!BRANDING_UPLOAD_CONTENT_TYPES.includes(file.type as (typeof BRANDING_UPLOAD_CONTENT_TYPES)[number])) {
      toast.error("Unsupported file type")
      return
    }
    if (file.size > BRANDING_LOGO_UPLOAD_MAX_BYTES) {
      toast.error("File too large")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : "")
    reader.readAsDataURL(file)
    setUploading(true)
    const toastId = toast.loading("Uploading logo...")
    try {
      const { uploadUrl, publicUrl } = await getLogoUploadUrl(slug, file.name, file.type, file.size)
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!res.ok) throw new Error("Upload failed")
      toast.loading("Saving...", { id: toastId })
      const result = await saveBranding(slug, { logoUrl: publicUrl })
      if (!result.ok) throw new Error(result.message || "Save failed")
      setWorkspaceLogo(slug, publicUrl)
      onChange(publicUrl)
      toast.success("Logo updated", { id: toastId })
    } catch (error: unknown) {
      const message = error instanceof Error && error.message ? error.message : "Failed to upload"
      toast.error(message, { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.currentTarget.files?.[0]
    if (f) void onFile(f)
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) void onFile(f)
  }

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
  }

  return (
    <div
      className={`relative w-8 h-8 rounded-md  bg-muted border ring-1 ring-border overflow-hidden ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      onClick={pick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      }}
      aria-label="Upload workspace logo"
      aria-disabled={disabled}
    >
      {preview ? (
        <Image
          src={preview}
          alt="Logo"
          fill
          sizes="32px"
          className="object-cover"
          unoptimized
          loader={({ src }) => src}
        />
      ) : null}
      <input ref={inputRef} type="file" accept={BRANDING_UPLOAD_CONTENT_TYPES.join(",")} className="hidden" onChange={onInputChange} />
    </div>
  )
}
