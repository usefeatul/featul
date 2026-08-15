"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { postToParent, useParentOrigin } from "./messaging";

export const WIDGET_SURFACE_DARK = "#1a1a1c";
export const WIDGET_SURFACE_LIGHT = "#ffffff";
export const WIDGET_ACCENT_FALLBACK = "#3b82f6";

export type WidgetThemeMode = "light" | "dark" | "auto";
export type WidgetResolvedTheme = "light" | "dark";

export function resolveWidgetAccent(primaryColor?: string | null) {
  const value = (primaryColor || "").trim();
  return value || WIDGET_ACCENT_FALLBACK;
}

export function resolveWidgetTheme(mode: WidgetThemeMode): WidgetResolvedTheme {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function widgetThemeVars(theme: WidgetResolvedTheme): Record<string, string> {
  if (theme === "light") {
    return {
      "--widget-surface": "255 255 255",
      "--widget-fg": "23 23 23",
      "--widget-cta": "23 23 23",
      "--widget-cta-fg": "255 255 255",
    };
  }
  return {
    "--widget-surface": "26 26 28",
    "--widget-fg": "250 250 250",
    "--widget-cta": "250 250 250",
    "--widget-cta-fg": "26 26 28",
  };
}

export function widgetSurfaceHex(theme: WidgetResolvedTheme) {
  return theme === "light" ? WIDGET_SURFACE_LIGHT : WIDGET_SURFACE_DARK;
}

function ThemeSync({
  mode,
  children,
}: {
  mode: WidgetThemeMode;
  children: React.ReactNode;
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const parentOrigin = useParentOrigin();

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
    postToParent(parentOrigin, "theme", { theme: resolved, mode });
  }, [resolvedTheme, mode, parentOrigin]);

  return <>{children}</>;
}

export function Theme({
  mode,
  children,
}: {
  mode: WidgetThemeMode;
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
      <ThemeSync mode={mode}>{children}</ThemeSync>
    </ThemeProvider>
  );
}
