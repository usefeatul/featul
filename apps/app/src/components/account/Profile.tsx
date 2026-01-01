"use client"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { LoadingButton } from "@/components/global/loading-button"
import SectionCard from "@/components/settings/global/SectionCard"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getInitials, getDisplayUser } from "@/utils/user-utils"
import { Input } from "@featul/ui/components/input"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import { client } from "@featul/api/client"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/hooks/usePostImageUpload"
import { Button } from "@featul/ui/components/button"

export default function Profile({ initialUser }: { initialUser?: { name?: string; email?: string; image?: string | null } | null }) {
  const queryClient = useQueryClient()
  const [name, setName] = React.useState(() => String(initialUser?.name || "").trim())
  const [image, setImage] = React.useState(() => String(initialUser?.image || ""))
  const [saving, setSaving] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const { data } = useQuery<{ user: { name?: string; email?: string; image?: string | null } | null }>({
    queryKey: ["me"],
    queryFn: async () => {
      const s = await authClient.getSession()
      const u = (s as any)?.data?.user || null
      return { user: u }
    },
    initialData: () => ({ user: (initialUser as any) || null }),
    placeholderData: (prev) => prev as any,
    staleTime: 300_000,
    gcTime: 900_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !initialUser,
  })

  const user = data?.user || null

  React.useEffect(() => {
    if (user) {
      setName((user?.name || "").trim())
      setImage(String(user?.image || ""))
      try { queryClient.setQueryData(["me"], { user }) } catch {}
    }
  }, [user, queryClient])

  const d = getDisplayUser(user || undefined)
  const initials = getInitials(d.name || "U")

  const onAvatarFile = React.useCallback(async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Please use PNG, JPEG, WebP, or GIF.")
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image too large. Maximum size is 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result)
      }
    }
    reader.readAsDataURL(file)

    setUploadingImage(true)
    const toastId = toast.loading("Uploading avatar...")
    try {
      const res = await client.storage.getAvatarUploadUrl.$post({
        fileName: file.name,
        contentType: file.type,
      })
      const data = await res.json()
      const uploadUrl = (data as any)?.uploadUrl as string
      const publicUrl = (data as any)?.publicUrl as string
      if (!uploadUrl || !publicUrl) {
        throw new Error("Upload failed")
      }

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!put.ok) {
        throw new Error("Upload failed")
      }

      const { error, data: updated } = await authClient.updateUser({ image: publicUrl })
      if (error) {
        throw new Error(error.message || "Failed to save avatar")
      }
      const updatedUser = (updated as any)?.user || {
        ...(user || {}),
        image: publicUrl,
      }
      setImage(publicUrl)
      try {
        queryClient.setQueryData(["me"], { user: updatedUser })
      } catch {}
      toast.success("Avatar updated", { id: toastId })
    } catch (e: any) {
      toast.error(e?.message || "Failed to upload avatar", { id: toastId })
      if (user?.image) {
        setImage(String(user.image))
      }
    } finally {
      setUploadingImage(false)
    }
  }, [user, queryClient])

  const pickImage = React.useCallback(() => {
    if (uploadingImage) return
    fileInputRef.current?.click()
  }, [uploadingImage])

  const onAvatarDrop: React.DragEventHandler<HTMLButtonElement> = React.useCallback(
    (e) => {
      e.preventDefault()
      if (uploadingImage) return
      const file = e.dataTransfer.files?.[0]
      if (file) void onAvatarFile(file)
    },
    [uploadingImage, onAvatarFile],
  )

  const onAvatarDragOver: React.DragEventHandler<HTMLButtonElement> = React.useCallback((e) => {
    e.preventDefault()
  }, [])

  const onAvatarInputChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback((e) => {
    const f = e.currentTarget.files?.[0]
    if (f) void onAvatarFile(f)
  }, [onAvatarFile])

  const onSave = React.useCallback(async () => {
    if (saving) return
    const nextName = name.trim()
    const nextImage = image.trim() || undefined
    if (!nextName && !nextImage && !user?.name && !user?.image) {
      toast.error("Please enter a name or image")
      return
    }
    setSaving(true)
    try {
      const { error, data } = await authClient.updateUser({ name: nextName || undefined, image: nextImage })
      if (error) {
        toast.error(error.message || "Failed to save")
        return
      }
      const updatedUser = (data as any)?.user || {
        ...(user || {}),
        name: nextName || user?.name,
        image: typeof nextImage === "string" ? nextImage : user?.image,
      }
      try { queryClient.setQueryData(["me"], { user: updatedUser }) } catch {}
      toast.success("Saved")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }, [saving, name, image, user, queryClient])


  return (
    <SectionCard title="Profile" description="Update your name and avatar">
      <div className="divide-y mt-2">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Avatar</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Button
              type="button"
              onClick={pickImage}
              onDrop={onAvatarDrop}
              onDragOver={onAvatarDragOver}
              aria-label="Change avatar"
              disabled={uploadingImage}
              variant="plain"
              size="icon-sm"
              className="relative bg-muted border ring-1 ring-border overflow-hidden"
            >
              <Avatar className="size-8">
                {image.trim() || d.image ? <AvatarImage src={image.trim() || d.image || ""} alt={d.name} /> : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={onAvatarInputChange}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Name</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-[220px] text-right" placeholder="Your name" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Email</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Input  value={d.email || ""} disabled className="h-9 w-[220px] text-right" />
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex justify-end">
        <LoadingButton onClick={onSave} loading={saving}>Save</LoadingButton>
      </div>
    </SectionCard>
  )
}
