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

export default function Profile({ initialUser }: { initialUser?: { name?: string; email?: string; image?: string | null } | null }) {
  const queryClient = useQueryClient()
  const [name, setName] = React.useState(() => String(initialUser?.name || "").trim())
  const [image, setImage] = React.useState(() => String(initialUser?.image || ""))
  const [saving, setSaving] = React.useState(false)
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
            <div className="flex items-center gap-3">
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="h-9 w-[220px] text-right"
                placeholder="Image URL"
              />
              <div className="rounded-md  border ring-1 ring-border overflow-hidden">
                <Avatar className="size-8">
                  {image.trim() || d.image ? <AvatarImage src={image.trim() || d.image || ""} alt={d.name} /> : null}
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
              </div>
            </div>
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
