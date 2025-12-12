"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@oreilla/ui/components/dialog"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"
import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { DropdownIcon } from "@oreilla/ui/icons/dropdown"
import { LoadingButton } from "@/components/global/loading-button"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"

type Role = "admin" | "member" | "viewer"
const ROLES: Role[] = ["admin", "member", "viewer"]

export default function InviteMemberModal({ slug, open, onOpenChange, onInvited }: { slug: string; open: boolean; onOpenChange: (v: boolean) => void; onInvited: () => void }) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-1/2 -translate-y-1/2 w-[min(92vw,450px)] sm:w-[380px] m-4">
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription className="text-accent">Send an invite by email</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="invite-email" className="sr-only">Email</Label>
            <Input id="invite-email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 h-8 placeholder:text-accent" />

            <Popover open={roleOpen} onOpenChange={setRoleOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" className="h-9 px-2">
                  <span className="rounded-md  px-2 py-0.5 capitalize">{role}</span>
                  <DropdownIcon className="ml-1 opacity-60" size={12} />
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

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <LoadingButton type="button" onClick={onSubmit} loading={loading} disabled={!email.trim()}>Send Invite</LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
