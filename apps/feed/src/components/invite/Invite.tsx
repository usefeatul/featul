"use client"

import React from "react"
import { Button } from "@feedgot/ui/components/button"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"

export default function Invite({ workspaceName, workspaceLogo, user, busy, onAccept, onDecline }: { workspaceName?: string | null; workspaceLogo?: string | null; user?: { name?: string; email?: string; image?: string | null } | null; busy?: boolean; onAccept: () => void; onDecline: () => void }) {
  const name = (user?.name || user?.email?.split("@")[0] || "").trim()
  const email = (user?.email || "").trim()
  const initials = getInitials(name || workspaceName || "U")
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-5">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">You've been invited</h1>
          <p className="mt-1 text-sm sm:text-base text-accent">{workspaceName ? `Join ${workspaceName}` : "Join this workspace"}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="rounded-md border ring-1 ring-border overflow-hidden">
              <Avatar className="size-8">
                {workspaceLogo ? <AvatarImage src={workspaceLogo} alt={workspaceName || "workspace"} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium truncate">{workspaceName}</div>
              {email ? <div className="text-xs text-accent truncate">{email}</div> : null}
            </div>
          </div>
        </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <Button type="button" variant="quiet" className="w-fit min-w-0" disabled={busy} onClick={onAccept}>Accept invitation</Button>
            <Button type="button" variant="quiet" className="w-fit min-w-0" disabled={busy} onClick={onDecline}>Decline</Button>
          </div>
      </div>
    </section>
  )
}
