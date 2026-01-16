"use client"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import SectionCard from "@/components/settings/global/SectionCard"
import SettingsCard from "@/components/global/SettingsCard"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getInitials, getDisplayUser } from "@/utils/user-utils"
import { Input } from "@featul/ui/components/input"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import { client } from "@featul/api/client"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/hooks/usePostImageUpload"
import { Button } from "@featul/ui/components/button"
import { AvatarIcon } from "@featul/ui/icons/avatar"
import { UserFocusIcon } from "@featul/ui/icons/userfocus"
import OAuthConnections from "./OAuthConnections"

export default function Profile({ initialUser, initialAccounts }: { initialUser?: { name?: string; email?: string; image?: string | null } | null; initialAccounts?: { id: string; accountId: string; providerId: string }[] }) {
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
      const sessionData = s && typeof s === "object" && "data" in s ? s.data : s
      const u = sessionData && typeof sessionData === "object" && "user" in sessionData ? sessionData.user : null
      return { user: u as { name?: string; email?: string; image?: string | null } | null }
    },
    initialData: () => ({ user: initialUser || null }),
    placeholderData: (prev) => prev,
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
      try { queryClient.setQueryData(["me"], { user }) } catch (e: unknown) {
        console.error(e)
      }
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
      const jsonData = await res.json() as { uploadUrl?: string; publicUrl?: string }
      const uploadUrl = jsonData.uploadUrl
      const publicUrl = jsonData.publicUrl
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
      const updatedUser = (updated && typeof updated === "object" && "user" in updated)
        ? updated.user as { name?: string; email?: string; image?: string | null }
        : { ...(user || {}), image: publicUrl }
      setImage(publicUrl)
      try {
        queryClient.setQueryData(["me"], { user: updatedUser })
      } catch (e: unknown) {
        console.error(e)
      }
      toast.success("Avatar updated", { id: toastId })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to upload avatar"
      toast.error(msg, { id: toastId })
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
    const toastId = toast.loading("Saving...")
    try {
      const { error, data: saveData } = await authClient.updateUser({ name: nextName || undefined, image: nextImage })
      if (error) {
        toast.error(error.message || "Failed to save", { id: toastId })
        return
      }
      const updatedUser = (saveData && typeof saveData === "object" && "user" in saveData)
        ? saveData.user as { name?: string; email?: string; image?: string | null }
        : {
          ...(user || {}),
          name: nextName || user?.name,
          image: typeof nextImage === "string" ? nextImage : user?.image,
        }
      try { queryClient.setQueryData(["me"], { user: updatedUser }) } catch (e: unknown) {
        console.error(e)
      } 
      toast.success("Saved", { id: toastId })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save"
      toast.error(msg, { id: toastId })
    } finally {
      setSaving(false)
    }
  }, [saving, name, image, user, queryClient])


  return (
    <SectionCard
      title="Profile"
      description="Manage your account settings and connected services"
    >
      <div className="grid grid-cols-2 gap-4">
        <SettingsCard
          title="Avatar"
          description="This is your public display avatar."
          icon={<AvatarIcon className="size-5 text-primary" />}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={pickImage}
              onDrop={onAvatarDrop}
              onDragOver={onAvatarDragOver}
              aria-label="Change avatar"
              disabled={uploadingImage}
              variant="plain"
              size="sm"
              className="relative bg-muted border ring-1 ring-border overflow-hidden"
            >
              <span className="flex items-center gap-2">
                <Avatar className="size-5">
                  {image.trim() || d.image ? <AvatarImage src={image.trim() || d.image || ""} alt={d.name} /> : null}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span>Change Avatar</span>
              </span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={onAvatarInputChange}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Account Details"
          description="Your name and email address."
          icon={<UserFocusIcon className="size-5 text-primary" />}
        >
          <div className="flex items-center gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => { if (name.trim() !== (user?.name || "").trim()) void onSave() }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur() } }}
              className="h-8 w-[140px]"
              placeholder="Your name"
            />
            <Input value={d.email || ""} disabled className="h-8 w-[140px]" />
          </div>
        </SettingsCard>

        <OAuthConnections initialAccounts={initialAccounts} />
      </div>
    </SectionCard>
  )
}
