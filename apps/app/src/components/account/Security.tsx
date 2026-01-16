"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@featul/ui/components/table"
import SectionCard from "@/components/settings/global/SectionCard"
import SettingsCard from "@/components/global/SettingsCard"
import { Button } from "@featul/ui/components/button"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ShieldIcon } from "@featul/ui/icons/shield"
import { KeyIcon } from "@featul/ui/icons/key"

export default function Security({ initialMeSession, initialSessions }: { initialMeSession?: unknown; initialSessions?: { token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string; expiresAt?: string }[] | null }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const queryClient = useQueryClient()

  type SessionData = { session?: { token?: string }; token?: string } | null

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

  const { data: sessions, isFetching } = useQuery<{ token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string; expiresAt?: string }[] | null>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const list = await authClient.listSessions()
      const arr = Array.isArray(list) ? list : ((list && typeof list === "object" && "data" in list) ? list.data as typeof sessions : [])
      return arr
    },
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: () => (Array.isArray(initialSessions) ? initialSessions : null),
    placeholderData: (prev) => prev,
  })

  const [revoking, setRevoking] = React.useState<string | null>(null)

  const onChangePassword = React.useCallback(() => {
    const redirect = encodeURIComponent(pathname)
    router.push(`/auth/forgot-password?redirect=${redirect}`)
  }, [router, pathname])

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
        router.replace(`/auth/sign-in?redirect=${encodeURIComponent(pathname)}`)
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
  }, [currentToken, revoking, queryClient, router, pathname])

  return (
    <SectionCard title="Security" description="Manage your password and active sessions">
      <div className="space-y-4">
        {/* Password and Sessions cards in 2-column grid */}
        <div className="grid grid-cols-2 gap-4">
          <SettingsCard
            icon={<KeyIcon className="size-5 text-primary" />}
            title="Password"
            description="Change your account password for security."
            buttonLabel="Change password"
            onAction={onChangePassword}
          />
          <SettingsCard
            icon={<ShieldIcon className="size-5 text-primary" opacity={1} />}
            title="Sessions"
            description="Sign out of all other devices and browsers."
            buttonLabel="Sign out all"
            buttonVariant="destructive"
            onAction={onSignOutAll}
          />
        </div>

        {/* Sessions table */}
        <div className="bg-card dark:bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black rounded-lg p-4">
          <div className="text-sm font-medium mb-3">Active Sessions</div>
          {isFetching ? (
            <div className="text-sm text-accent">Loading sessions…</div>
          ) : Array.isArray(sessions) && sessions.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[56%]">Device</TableHead>
                    <TableHead className="w-[16%] text-center">IP</TableHead>
                    <TableHead className="w-[16%] text-center">Expires</TableHead>
                    <TableHead className="w-[12%] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(sessions || []).map((s) => {
                    const isCurrent = s.token === currentToken
                    const ua = String(s.userAgent || "").slice(0, 80)
                    const ip = String(s.ipAddress || "-")
                    const exp = s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "-"
                    return (
                      <TableRow key={s.token}>
                        <TableCell className="px-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate block">{ua || "Unknown"}</span>
                            {isCurrent ? <span className="ml-2 text-xs rounded-md bg-muted px-2 py-0.5">This device</span> : null}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 text-center">{ip}</TableCell>
                        <TableCell className="px-3 text-center">{exp}</TableCell>
                        <TableCell className="px-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant={isCurrent ? "secondary" : "destructive"}
                            onClick={() => revokeOne(s.token)}
                            aria-disabled={revoking === s.token}
                          >
                            {isCurrent ? "Sign out" : "Remove"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-accent">No active sessions</div>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

