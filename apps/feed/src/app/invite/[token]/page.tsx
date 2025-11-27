"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import Invite from "@/components/invite/Invite"
import { authClient } from "@feedgot/auth/client"

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const [busy, setBusy] = React.useState(false)
  const [token, setToken] = React.useState<string>("")
  const [workspaceName, setWorkspaceName] = React.useState<string | null>(null)
  const [workspaceLogo, setWorkspaceLogo] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<any>(null)
  const router = useRouter()

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const { token } = await params
      if (!token) return
      setToken(token)
      try {
        const res = await client.team.inviteByToken.$get({ token })
        const data = await res.json()
        if (!mounted) return
        setWorkspaceName((data?.invite?.workspaceName as string) || null)
        setWorkspaceLogo((data?.invite?.workspaceLogo as string) || null)
        const s = await authClient.getSession()
        if (mounted) setUser(s?.data?.user || null)
      } catch {}
    })()
    return () => {
      mounted = false
    }
  }, [params])

  return (
    <Invite
      workspaceName={workspaceName}
      workspaceLogo={workspaceLogo}
      user={user}
      busy={busy}
      onAccept={async () => {
        if (!token || busy) return
        setBusy(true)
        try {
          const res = await client.team.acceptInvite.$post({ token })
          if (!res.ok) throw new Error("Invite failed")
          toast.success("Invite accepted")
          router.replace("/start")
        } catch (e) {
          toast.error("Invite failed")
        } finally {
          setBusy(false)
        }
      }}
      onDecline={async () => {
        if (!token || busy) return
        setBusy(true)
        try {
          const res = await client.team.declineInvite.$post({ token })
          if (!res.ok) throw new Error("Decline failed")
          toast.success("Invite declined")
          router.replace("/start")
        } catch (e) {
          toast.error("Invite failed")
        } finally {
          setBusy(false)
        }
      }}
    />
  )
}
