"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import MainThemeProvider from "@/components/global/MainThemeProvider";

/**
 * The embeddable widget iframe must not inherit the dashboard `app-theme`
 * preference from next-themes (same-origin localStorage). Otherwise
 * `theme: "auto"` ignores the OS and stays stuck on the app's dark setting.
 */
export default function ConditionalThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/widget")) {
    return <>{children}</>;
  }
  return <MainThemeProvider>{children}</MainThemeProvider>;
}
