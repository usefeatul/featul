"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { AuthMode } from "@/types/auth";

type SubdomainAuthModalState = {
  isOpen: boolean;
  mode: AuthMode;
  redirectTo: string;
  setOpen: (open: boolean) => void;
  setMode: (mode: AuthMode) => void;
  openAuth: (mode: AuthMode) => void;
};

export function useSubdomainAuthModal(): SubdomainAuthModalState {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const [isOpen, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<AuthMode>("sign-in");
  const [redirectTo, setRedirectTo] = React.useState("");

  const resolveRedirect = React.useCallback(() => {
    const query = searchParams?.toString();
    const path = `${pathname}${query ? `?${query}` : ""}`;
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [pathname, searchParams]);

  const openAuth = React.useCallback(
    (nextMode: AuthMode) => {
      setRedirectTo(resolveRedirect());
      setMode(nextMode);
      setOpen(true);
    },
    [resolveRedirect]
  );

  return {
    isOpen,
    mode,
    redirectTo,
    setOpen,
    setMode,
    openAuth,
  };
}
