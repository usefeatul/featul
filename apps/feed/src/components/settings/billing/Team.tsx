"use client"

import React from "react"
import SectionCard from "../global/SectionCard"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@feedgot/ui/components/select"
import { LoadingButton } from "@/components/loading-button"
import { Button } from "@feedgot/ui/components/button"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"

type Member = { userId: string; role: "admin" | "member" | "viewer"; isOwner?: boolean; joinedAt?: string; isActive?: boolean; name?: string; email?: string; image?: string }
type Invite = { id: string; email: string; role: "admin" | "member" | "viewer"; invitedBy: string; expiresAt: string; acceptedAt?: string | null; createdAt: string }

export default function TeamSection({ slug }: { slug: string }) {
  const [members, setMembers] = React.useState<Member[]>([])
  const [invites, setInvites] = React.useState<Invite[]>([])
  const [loading, setLoading] = React.useState(true)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<"admin" | "member" | "viewer">("member")
  const [inviting, setInviting] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        const res = await client.team.membersByWorkspaceSlug.$get({ slug })
        const data = await res.json()
        if (mounted) {
          setMembers(data?.members || [])
          setInvites(data?.invites || [])
        }
      } catch (e) {}
      finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [slug])

  const refresh = async () => {
    const res = await client.team.membersByWorkspaceSlug.$get({ slug })
    const data = await res.json()
    setMembers(data?.members || [])
    setInvites(data?.invites || [])
  }

  const handleInvite = async () => {
    if (!email.trim()) return
    if (inviting) return
    setInviting(true)
    try {
      const res = await client.team.invite.$post({ slug, email: email.trim(), role })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Invite failed")
      }
      toast.success("Invite sent")
      setEmail("")
      await refresh()
    } catch (e) {
      toast.error("Failed to invite member")
    } finally { setInviting(false) }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "member" | "viewer") => {
    try {
      const res = await client.team.updateRole.$post({ slug, userId, role: newRole })
      if (!res.ok) throw new Error("Update failed")
      toast.success("Role updated")
      setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)))
    } catch (e) {
      toast.error("Failed to update role")
    }
  }

  const handleRemove = async (userId: string) => {
    try {
      const res = await client.team.removeMember.$post({ slug, userId })
      if (!res.ok) throw new Error("Remove failed")
      toast.success("Member removed")
      await refresh()
    } catch (e) {
      toast.error("Failed to remove member")
    }
  }

  const handleRevoke = async (inviteId: string) => {
    try {
      const res = await client.team.revokeInvite.$post({ slug, inviteId })
      if (!res.ok) throw new Error("Revoke failed")
      toast.success("Invite revoked")
      await refresh()
    } catch (e) {
      toast.error("Failed to revoke invite")
    }
  }

  return (
    <SectionCard title="Team" description="Manage members and roles">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Invite member</Label>
          <div className="flex items-center gap-2 max-w-xl">
            <Input placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <LoadingButton onClick={handleInvite} loading={inviting} disabled={loading}>Invite</LoadingButton>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Members</Label>
          <div className="divide-y rounded-md border">
            {members.length === 0 && !loading ? (
              <div className="p-4 text-sm text-accent">No members</div>
            ) : (
              members.map((m) => (
                <div key={m.userId} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.name || m.email || m.userId}</div>
                    <div className="text-xs text-accent truncate">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={m.role} onValueChange={(v) => handleRoleChange(m.userId, v as any)} disabled={m.isOwner === true}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => handleRemove(m.userId)} disabled={m.isOwner === true}>Remove</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pending Invites</Label>
          <div className="divide-y rounded-md border">
            {invites.length === 0 && !loading ? (
              <div className="p-4 text-sm text-accent">No pending invites</div>
            ) : (
              invites.map((i) => (
                <div key={i.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.email}</div>
                    <div className="text-xs text-accent">Expires {new Date(i.expiresAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{i.role}</span>
                    <Button variant="outline" onClick={() => handleRevoke(i.id)}>Revoke</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
