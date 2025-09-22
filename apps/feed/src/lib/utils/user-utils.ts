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

export function getDisplayUser(user: User | null | undefined): DisplayUser {
  if (!user) {
    return {
      name: "Guest",
      email: "",
      image: "",
    }
  }

  // Extract first name only
  const fullName = user.name || user.email?.split("@")[0] || "User"
  const firstName = fullName.split(" ")[0]

  return {
    name: firstName || "",
    email: user.email || "",
    image: user.image || "",
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}