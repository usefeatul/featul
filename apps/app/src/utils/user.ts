export interface DisplayUser {
  name: string
  email: string
  image: string
}

export interface User {
  name?: string
  email?: string
  image?: string | null
}

/** Fill name/email/image for UI. Missing users become Guest. */
export function getDisplayUser(user: User | null | undefined): DisplayUser {
  if (!user) {
    return {
      name: "Guest",
      email: "",
      image: "",
    }
  }

  const fullName = (user.name || user.email?.split("@")[0] || "User").trim()

  return {
    name: fullName,
    email: user.email || "",
    image: user.image || "",
  }
}


/** Up to two uppercase letters from the first letters of words. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

import { randomAvatarUrl } from "./avatar"

/** Hide identity as “Member” when requested. Always supply a DiceBear image if none. */
export function getPrivacySafeDisplayUser(
  user: User | null | undefined,
  hideIdentity: boolean = false,
  seed?: string
): DisplayUser {
  const displayUser = getDisplayUser(user)
  
  // If identity is hidden and user is not a Guest (Guest is already anonymous)
  if (hideIdentity && displayUser.name !== "Guest") {
    return {
      name: "Member",
      email: "",
      image: randomAvatarUrl("member", "avataaars")
    }
  }

  // If no image is present (Guest or Signed-in user without avatar), generate one
  if (!displayUser.image) {
    return {
      ...displayUser,
      image: randomAvatarUrl(seed || displayUser.name || "anonymous", "avataaars")
    }
  }

  return displayUser
}
