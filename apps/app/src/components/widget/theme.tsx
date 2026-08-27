"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { postToParent, useParentOrigin } from "./messaging";

export const WIDGET_SURFACE_DARK = "#1a1a1c";
export const WIDGET_SURFACE_LIGHT = "#ffffff";
export const WIDGET_SHELL_DARK = "#000000";
export const WIDGET_SHELL_LIGHT = "#f4f4f5";
export const WIDGET_ACCENT_FALLBACK = "#3b82f6";

export type WidgetThemeMode = "light" | "dark" | "auto";
export type WidgetResolvedTheme = "light" | "dark";
export type WidgetLayoutStyle = "compact" | "comfortable" | "spacious";

/** Map layout style to the matching widget CSS class. Comfortable is default. */
export function widgetLayoutClass(layout: WidgetLayoutStyle) {
  if (layout === "compact") return "widget-layout-compact";
  if (layout === "spacious") return "widget-layout-spacious";
  return "widget-layout-comfortable";
}

/** Workspace primary color, or the widget accent fallback. */
export function resolveWidgetAccent(primaryColor?: string | null) {
  const value = (primaryColor || "").trim();
  return value || WIDGET_ACCENT_FALLBACK;
}

/** Parse 3- or 6-digit hex into RGB. Invalid input returns null. */
function parseHexRgb(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** CSS vars for accent/CTA. Light accents get dark CTA text. */
export function widgetAccentVars(accent: string): Record<string, string> {
  const rgb = parseHexRgb(accent);
  if (!rgb) return { "--widget-accent": accent };
  const [r, g, b] = rgb;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return {
    "--widget-accent": accent,
    "--widget-cta": `${r} ${g} ${b}`,
    "--widget-cta-fg": luminance > 0.62 ? "23 23 23" : "255 255 255",
  };
}

/** Resolve light/dark. `auto` follows OS; SSR defaults to dark. */
export function resolveWidgetTheme(mode: WidgetThemeMode): WidgetResolvedTheme {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Shell/surface/foreground RGB vars for the resolved widget theme. */
export function widgetThemeVars(theme: WidgetResolvedTheme): Record<string, string> {
  if (theme === "light") {
    return {
      "--widget-shell": "244 244 245",
      "--widget-surface": "255 255 255",
      "--widget-fg": "23 23 23",
      "--widget-cta": "23 23 23",
      "--widget-cta-fg": "255 255 255",
    };
  }
  return {
    "--widget-shell": "0 0 0",
    "--widget-surface": "26 26 28",
    "--widget-fg": "250 250 250",
    "--widget-cta": "250 250 250",
    "--widget-cta-fg": "26 26 28",
  };
}

export function widgetSurfaceHex(theme: WidgetResolvedTheme) {
  return theme === "light" ? WIDGET_SURFACE_LIGHT : WIDGET_SURFACE_DARK;
}

export function widgetShellHex(theme: WidgetResolvedTheme) {
  return theme === "light" ? WIDGET_SHELL_LIGHT : WIDGET_SHELL_DARK;
}

/** Push resolved theme to the document and parent frame. */
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
      resolved === "light" ? WIDGET_SHELL_LIGHT : WIDGET_SHELL_DARK;
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
