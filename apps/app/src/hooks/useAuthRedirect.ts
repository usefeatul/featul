"use client";

import { useSearchParams } from "next/navigation";
import { normalizeRedirectParam, resolveAuthRedirect } from "@/utils/redirect";

export function useAuthRedirect(redirectTo?: string) {
  const params = useSearchParams();
  const rawRedirect = redirectTo || params?.get("redirect") || "";
  const safeRedirectParam = normalizeRedirectParam(rawRedirect);
  const redirect = resolveAuthRedirect(rawRedirect);

  return { rawRedirect, safeRedirectParam, redirect };
}
