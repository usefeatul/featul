import type { QueryClient } from "@tanstack/react-query"
import { accountQueryKeys } from "./keys"
import type { CurrentSessionState, DeviceAccount, SessionUser } from "./types"

export type AccountProfileUser = {
  id?: string
  name?: string
  email?: string
  image?: string | null
}

function mergeUser(
  previous: SessionUser | AccountProfileUser | null | undefined,
  next: AccountProfileUser,
): SessionUser {
  return { ...(previous || {}), ...next }
}

function nextImage(user: AccountProfileUser, fallback: string): string {
  if (user.image === undefined) return fallback
  return typeof user.image === "string" ? user.image : ""
}

function nextName(user: AccountProfileUser, fallback: string): string {
  const name = typeof user.name === "string" ? user.name.trim() : ""
  return name || fallback
}

/** Patch profile name/image in every account cache the sidebar reads. */
export function updateAccountUserInCache(
  queryClient: QueryClient,
  user: AccountProfileUser,
) {
  queryClient.setQueryData<{ user: AccountProfileUser | null }>(
    accountQueryKeys.me,
    (prev) => ({ user: mergeUser(prev?.user, user) }),
  )

  queryClient.setQueryData<CurrentSessionState>(
    accountQueryKeys.meSidebar,
    (prev) => {
      const nextUser = mergeUser(prev?.user, user)
      const userId =
        (typeof nextUser.id === "string" && nextUser.id.trim()) ||
        prev?.userId ||
        null
      return { user: nextUser, userId }
    },
  )

  queryClient.setQueryData<DeviceAccount[]>(
    accountQueryKeys.deviceAccountsSidebar,
    (prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev
      const userId = typeof user.id === "string" ? user.id.trim() : ""
      return prev.map((account) => {
        const isTarget =
          account.isCurrent ||
          (Boolean(userId) && account.userId === userId)
        if (!isTarget) return account
        return {
          ...account,
          name: nextName(user, account.name),
          image: nextImage(user, account.image),
        }
      })
    },
  )
}
