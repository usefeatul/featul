"use client"

import React from "react"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import MemberIcon from "@featul/ui/icons/member"
import { LoadingButton } from "@/components/global/loading-button"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import type { Role } from "../../../types/team"

const ROLES: Role[] = ["admin", "member", "viewer"]

interface InviteMemberModalProps {
  slug: string
  open: boolean
  onOpenChange: (value: boolean) => void
  onInvited: () => void
}

export default function InviteMemberModal({ slug, open, onOpenChange, onInvited }: InviteMemberModalProps) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<Role>("member")
  const [loading, setLoading] = React.useState(false)
  const [roleOpen, setRoleOpen] = React.useState(false)

  const onSubmit = async () => {
    const value = email.trim()
    if (!value) return
    if (loading) return
    setLoading(true)
    try {
      const res = await client.team.invite.$post({ slug, email: value, role })
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || "Invite failed")
      }
      toast.success("Invite sent")
      setEmail("")
      onInvited()
      onOpenChange(false)
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || "Failed to invite member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Invite member"
      description="Send an invite by email"
      icon={<MemberIcon className="size-3.5" />}
    >
      <div className="flex items-center gap-2">
        <Label htmlFor="invite-email" className="sr-only">Email</Label>
        <Input id="invite-email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 h-10 placeholder:text-accent" />
 
        <Popover open={roleOpen} onOpenChange={setRoleOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="nav">
              <span className="rounded-md px-2 py-0.5 capitalize">{role}</span>
              <DropdownIcon className="ml-1 size-3 opacity-100" />
            </Button>
          </PopoverTrigger>
          <PopoverContent list className="min-w-0 w-fit">
            <PopoverList>
              {ROLES.map((r) => (
                <PopoverListItem key={r} role="menuitemradio" aria-checked={role === r} onClick={() => { setRole(r); setRoleOpen(false) }}>
                  <span className="text-sm capitalize">{r}</span>
                  {role === r ? <span className="ml-auto text-xs">✓</span> : null}
                </PopoverListItem>
              ))}
            </PopoverList>
          </PopoverContent>
        </Popover>
      </div>
 
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="card" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <LoadingButton
          type="button"
          onClick={onSubmit}
          loading={loading}
          disabled={!email.trim()}
        >
          Send Invite
        </LoadingButton>
      </div>
    </SettingsDialogShell>
  )
}
