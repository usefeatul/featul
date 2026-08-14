"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";

import { WIDGET_SURFACE_DARK, WIDGET_SURFACE_LIGHT, widgetThemeVars } from "./theme";

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
    const root = document.documentElement;
    root.style.colorScheme = resolved;
    root.classList.toggle("dark", resolved === "dark");
    root.classList.toggle("light", resolved === "light");
    const vars = widgetThemeVars(resolved);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    document.body.style.background =
      resolved === "light" ? WIDGET_SURFACE_LIGHT : WIDGET_SURFACE_DARK;
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
