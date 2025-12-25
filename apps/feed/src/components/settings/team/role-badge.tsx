import type { Role } from "../../../types/team";

export function roleBadgeClass(role: Role, isOwner?: boolean) {
  if (isOwner) return "text-primary";
  if (role === "admin") return "text-orange-500";
  if (role === "viewer") return "text-green-500";
  return " text-blue-500";
}
