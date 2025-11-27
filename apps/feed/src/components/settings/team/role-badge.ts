import type { Role } from "./types";

export function roleBadgeClass(role: Role, isOwner?: boolean) {
  if (isOwner) return "bg-primary/20 text-primary";
  if (role === "admin") return "bg-orange-50 text-orange-500";
  if (role === "viewer") return "bg-green-50 text-green-500";
  return "bg-card text-accent";
}

