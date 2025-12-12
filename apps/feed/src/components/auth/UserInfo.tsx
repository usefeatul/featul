"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@oreilla/auth/client"
import { Button } from "@oreilla/ui/components/button"
import { Avatar, AvatarImage, AvatarFallback } from "@oreilla/ui/components/avatar"
import { getDisplayUser, getInitials } from "@/utils/user-utils"

export default function UserInfo({ user: userProp }: { user?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const user = getDisplayUser(userProp)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await authClient.signOut()
      router.push("/auth/sign-in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
        {user.email ? <span className="text-xs text-muted-foreground">{user.email}</span> : null}
      </div>
      <Button size="sm" onClick={handleSignOut} disabled={loading}>
        {loading ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  )
}