import type { AuthUser } from "@/types/auth";

export function hasAuthUser(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.id || user?.email || user?.name);
}
