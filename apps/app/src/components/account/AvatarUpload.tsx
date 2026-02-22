"use client"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import SettingsCard from "@/components/global/SettingsCard"
import { useQueryClient } from "@tanstack/react-query"
import { getInitials, getDisplayUser } from "@/utils/user-utils"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import { client } from "@featul/api/client"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/hooks/usePostImageUpload"
import { Button } from "@featul/ui/components/button"
import { AvatarIcon } from "@featul/ui/icons/avatar"

type AvatarUploadProps = {
    initialUser?: { name?: string; email?: string; image?: string | null } | null
}

export default function AvatarUpload({ initialUser }: AvatarUploadProps) {
    const queryClient = useQueryClient()
    const [image, setImage] = React.useState(() => String(initialUser?.image || ""))
    const [uploadingImage, setUploadingImage] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)

    const d = getDisplayUser(initialUser || undefined)
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
                fileSize: file.size,
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
                : { ...(initialUser || {}), image: publicUrl }
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
            if (initialUser?.image) {
                setImage(String(initialUser.image))
            }
        } finally {
            setUploadingImage(false)
        }
    }, [initialUser, queryClient])

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

    return (
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
    )
}
