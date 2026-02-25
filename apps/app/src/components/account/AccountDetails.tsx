"use client"

import React from "react"
import SettingsCard from "@/components/global/SettingsCard"
import Passkeys, { type PasskeyItem } from "./Passkeys"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getDisplayUser } from "@/utils/user"
import { Input } from "@featul/ui/components/input"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import { UserFocusIcon } from "@featul/ui/icons/userfocus"

type AccountDetailsProps = {
    initialUser?: { name?: string; email?: string; image?: string | null } | null
    initialPasskeys?: PasskeyItem[]
}

export default function AccountDetails({ initialUser, initialPasskeys }: AccountDetailsProps) {
    const queryClient = useQueryClient()
    const [name, setName] = React.useState(() => String(initialUser?.name || "").trim())
    const [saving, setSaving] = React.useState(false)

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
            try { queryClient.setQueryData(["me"], { user }) } catch (e: unknown) {
                console.error(e)
            }
        }
    }, [user, queryClient])

    const d = getDisplayUser(user || undefined)

    const onSave = React.useCallback(async () => {
        if (saving) return
        const nextName = name.trim()
        const previousName = (user?.name || "").trim()

        // Skip if no change
        if (nextName === previousName) return

        if (!nextName && !previousName) {
            toast.error("Please enter a name")
            return
        }

        setSaving(true)

        // Optimistic update - instant UI feedback
        const optimisticUser = { ...(user || {}), name: nextName || previousName }
        try { queryClient.setQueryData(["me"], { user: optimisticUser }) } catch (e: unknown) {
            console.error(e)
        }
        toast.success("Saved")

        try {
            const { error, data: saveData } = await authClient.updateUser({ name: nextName || undefined })
            if (error) {
                // Revert on error
                try { queryClient.setQueryData(["me"], { user }) } catch (e: unknown) {
                    console.error(e)
                }
                setName(previousName)
                toast.error(error.message || "Failed to save")
                return
            }
            // Update with server response if available
            const updatedUser = (saveData && typeof saveData === "object" && "user" in saveData)
                ? saveData.user as { name?: string; email?: string; image?: string | null }
                : optimisticUser
            try { queryClient.setQueryData(["me"], { user: updatedUser }) } catch (e: unknown) {
                console.error(e)
            }
        } catch (err: unknown) {
            // Revert on error
            try { queryClient.setQueryData(["me"], { user }) } catch (e: unknown) {
                console.error(e)
            }
            setName(previousName)
            const msg = err instanceof Error ? err.message : "Failed to save"
            toast.error(msg)
        } finally {
            setSaving(false)
        }
    }, [saving, name, user, queryClient])

    return (
        <>
            <SettingsCard
                title="Account"
                description="Your name and email address."
                icon={<UserFocusIcon className="size-5 text-primary" />}
            >
                <div className="flex items-center gap-3">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => { if (name.trim() !== (user?.name || "").trim()) void onSave() }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur() } }}
                        className="h-8 w-[100px] placeholder:text-accent"
                        placeholder="Your name"
                    />
                    <Input value={d.email || ""} disabled className="hidden lg:block h-8 w-[170px] text-center" />
                </div>
            </SettingsCard>
            <Passkeys initialPasskeys={initialPasskeys} />
        </>
    )
}
