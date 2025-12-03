"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@feedgot/ui/components/table"
import SectionCard from "@/components/settings/global/SectionCard"
import { Button } from "@feedgot/ui/components/button"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@feedgot/auth/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function Security({ initialMeSession, initialSessions }: { initialMeSession?: any; initialSessions?: { token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string; expiresAt?: string }[] | null }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const queryClient = useQueryClient()

  const { data: meSession } = useQuery({
    queryKey: ["me-session"],
    queryFn: async () => {
      const s = await authClient.getSession()
      return (s as any)?.data || null
    },
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: () => (initialMeSession as any) || undefined,
    placeholderData: (prev) => prev as any,
  })
  const currentToken = String(((meSession as any)?.session?.token || (meSession as any)?.token || ""))

  const { data: sessions, isFetching } = useQuery<{ token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string; expiresAt?: string }[] | null>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const list = await authClient.listSessions()
      const arr = Array.isArray(list) ? list : ((list as any)?.data || [])
      return arr
    },
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: () => (Array.isArray(initialSessions) ? initialSessions : null),
    placeholderData: (prev) => prev as any,
  })

  const [revoking, setRevoking] = React.useState<string | null>(null)

  const onChangePassword = React.useCallback(() => {
    const redirect = encodeURIComponent(pathname)
    router.push(`/auth/forgot-password?redirect=${redirect}`)
  }, [router, pathname])

  const onSignOutAll = React.useCallback(async () => {
    try {
      await authClient.revokeOtherSessions()
      toast.success("Signed out of other devices")
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    } catch {
      toast.error("Failed to sign out other devices")
    }
  }, [queryClient])

  const revokeOne = React.useCallback(async (token: string) => {
    if (revoking) return
    setRevoking(token)
    try {
      if (token && token === currentToken) {
        await authClient.signOut()
        toast.success("Signed out")
        router.replace(`/auth/sign-in?redirect=${encodeURIComponent(pathname)}`)
      } else {
        await authClient.revokeSession({ token })
        toast.success("Session removed")
      }
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    } catch {
      toast.error("Failed to remove session")
    } finally {
      setRevoking(null)
    }
  }, [currentToken, revoking, queryClient])

  return (
    <SectionCard title="Security" description="Manage password and sessions">
      <div className="divide-y mt-2">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Password</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Button onClick={onChangePassword}>Change password</Button>
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Sessions</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Button variant="secondary" onClick={onSignOutAll}>Sign out of other devices</Button>
          </div>
        </div>
        <div className="p-4">
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
