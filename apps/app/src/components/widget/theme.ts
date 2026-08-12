export const WIDGET_SURFACE_DARK = "#000000";
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
    "--widget-surface": "0 0 0",
    "--widget-fg": "255 255 255",
    "--widget-cta": "255 255 255",
    "--widget-cta-fg": "23 23 23",
  };
}

export function widgetSurfaceHex(theme: WidgetResolvedTheme) {
  return theme === "light" ? WIDGET_SURFACE_LIGHT : WIDGET_SURFACE_DARK;
}
