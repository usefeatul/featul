"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";

function WidgetThemeSync({
  mode,
  children,
}: {
  mode: "light" | "dark" | "auto";
  children: React.ReactNode;
}) {
  const { setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setTheme(mode === "auto" ? "system" : mode);
  }, [mode, setTheme]);

  React.useEffect(() => {
    const resolved = resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : null;
    if (!resolved) return;
    document.documentElement.style.colorScheme = resolved;
    document.body.style.background = resolved === "light" ? "#ffffff" : "#000000";
    window.parent.postMessage(
      {
        source: "featul-widget-frame",
        type: "theme",
        payload: { theme: resolved, mode },
      },
      "*",
    );
  }, [resolvedTheme, mode]);

  return <>{children}</>;
}

export function WidgetThemeProvider({
  mode,
  children,
}: {
  mode: "light" | "dark" | "auto";
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={mode === "auto" ? "system" : mode}
      forcedTheme={mode === "auto" ? undefined : mode}
      enableSystem={mode === "auto"}
      storageKey="featul-widget-theme"
      disableTransitionOnChange
    >
      <WidgetThemeSync mode={mode}>{children}</WidgetThemeSync>
    </ThemeProvider>
  );
}
