"use client"

import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import SettingsCard from "@/components/global/SettingsCard"
import { ShieldIcon } from "@featul/ui/icons/shield"
import { Button } from "@featul/ui/components/button"
import { LoaderIcon } from "@featul/ui/icons/loader"

type SessionItem = {
    token: string
    userAgent?: string | null
    ipAddress?: string | null
    createdAt?: string | Date
    expiresAt?: string | Date
}

type SessionData = { session?: { token?: string }; token?: string } | null

export default function ActiveSessions({ initialSessions, initialMeSession }: { initialSessions?: SessionItem[] | null, initialMeSession?: unknown }) {
    const queryClient = useQueryClient()
    const [revoking, setRevoking] = React.useState<string | null>(null)

    const { data: meSession } = useQuery<SessionData>({
        queryKey: ["me-session"],
        queryFn: async () => {
            const s = await authClient.getSession()
            return (s && typeof s === "object" && "data" in s) ? s.data as SessionData : null
        },
        staleTime: 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        initialData: () => (initialMeSession as SessionData) || undefined,
        placeholderData: (prev) => prev,
    })
    const currentToken = String(meSession?.session?.token || meSession?.token || "")

    const { data: sessions, isFetching } = useQuery<SessionItem[] | null>({
        queryKey: ["sessions"],
        queryFn: async () => {
            const list = await authClient.listSessions()
            const arr = Array.isArray(list) ? list : ((list && typeof list === "object" && "data" in list) ? (list as unknown as { data: SessionItem[] }).data : [])
            return arr
        },
        staleTime: 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        initialData: () => (initialSessions || null),
        placeholderData: (prev) => prev,
    })

    const onSignOutAll = React.useCallback(async () => {
        const toastId = toast.loading("Signing out...")
        try {
            await authClient.revokeOtherSessions()
            toast.success("Signed out of other devices", { id: toastId })
            queryClient.invalidateQueries({ queryKey: ["sessions"] })
        } catch {
            toast.error("Failed to sign out other devices", { id: toastId })
        }
    }, [queryClient])

    const revokeOne = React.useCallback(async (token: string) => {
        if (revoking) return
        setRevoking(token)
        const toastId = toast.loading("Removing session...")
        try {
            if (token && token === currentToken) {
                await authClient.signOut()
                toast.success("Signed out", { id: toastId })
                window.location.reload()
            } else {
                await authClient.revokeSession({ token })
                toast.success("Session removed", { id: toastId })
            }
            queryClient.invalidateQueries({ queryKey: ["sessions"] })
        } catch {
            toast.error("Failed to remove session", { id: toastId })
        } finally {
            setRevoking(null)
        }
    }, [currentToken, revoking, queryClient])

    return (
        <SettingsCard
            title="Active Sessions"
            description={
                <div className="space-y-3">
                    <div className="text-sm text-accent mb-2">
                        Manage your active sessions on other devices and browsers.
                    </div>
                    {isFetching ? (
                        <div className="flex items-center gap-2 text-sm text-accent py-4">
                            <LoaderIcon className="animate-spin size-4" />
                            Loading sessions...
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {(sessions || []).map((s) => {
                                const isCurrent = s.token === currentToken
                                const ua = String(s.userAgent || "Unknown Device").slice(0, 80)
                                const ip = String(s.ipAddress || "-")
                                const exp = s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "-"

                                return (
                                    <div key={s.token} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-background border border-border/50 gap-3">
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            <div className="mt-1 sm:mt-0 p-2 rounded-full bg-muted/50 shrink-0">
                                                <ShieldIcon className="size-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-medium truncate">{ua}</span>
                                                    {isCurrent && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-accent mt-1">
                                                    <span>IP: {ip}</span>
                                                    <span className="hidden sm:inline">&bull;</span>
                                                    <span>Exp: {exp}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end sm:ml-auto">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                                                onClick={() => revokeOne(s.token)}
                                                disabled={!!revoking}
                                            >
                                                {revoking === s.token ? "Removing..." : "Remove"}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                            {(!sessions || sessions.length === 0) && (
                                <div className="text-sm text-accent py-2">No active sessions found.</div>
                            )}
                        </div>
                    )}
                </div>
            }
            icon={<ShieldIcon className="size-5 text-primary" />}
            buttonLabel="Sign out all other devices"
            buttonVariant="destructive"
            onAction={onSignOutAll}
        />
    )
}
