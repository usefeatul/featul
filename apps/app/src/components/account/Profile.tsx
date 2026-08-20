"use client"

import OAuthConnections from "./OAuthConnections"
import DeleteAccount from "./DeleteAccount"
import AvatarUpload from "./AvatarUpload"
import AccountDetails from "./AccountDetails"
import type { PasskeyItem } from "./Passkeys"

type ProfileProps = {
  initialUser?: { name?: string; email?: string; image?: string | null } | null
  initialAccounts?: { id: string; accountId: string; providerId: string }[]
  initialPasskeys?: PasskeyItem[]
}

export default function Profile({ initialUser, initialAccounts, initialPasskeys }: ProfileProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-fr md:items-stretch">
      <AvatarUpload initialUser={initialUser} />
      <AccountDetails initialUser={initialUser} initialPasskeys={initialPasskeys} />
      <OAuthConnections initialAccounts={initialAccounts} />
      <DeleteAccount />
    </div>
  )
}
