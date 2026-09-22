"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import MainThemeProvider from "@/components/global/MainThemeProvider";

/**
 * Public workspaces and the embeddable widget own their theme providers and
 * must not inherit the dashboard `app-theme` preference from next-themes.
 */
export default function ConditionalThemeProvider({
  children,
  publicWorkspace = false,
}: {
  children: React.ReactNode;
  publicWorkspace?: boolean;
}) {
  const pathname = usePathname();
  if (publicWorkspace || pathname?.startsWith("/widget")) {
    return <>{children}</>;
  }
  return <MainThemeProvider>{children}</MainThemeProvider>;
}
