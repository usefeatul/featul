import type { AuthUser } from "@/types/auth";

/** True when any identifying field is present. Empty objects count as logged out. */
export function hasAuthUser(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.id || user?.email || user?.name);
}
