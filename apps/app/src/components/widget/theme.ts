export const WIDGET_SURFACE = "#171717";
export const WIDGET_SURFACE_RAISED = "#202020";
export const WIDGET_SURFACE_CARD = "#242424";
export const WIDGET_ACCENT_FALLBACK = "#3b82f6";

export function resolveWidgetAccent(primaryColor?: string | null) {
  const value = (primaryColor || "").trim();
  return value || WIDGET_ACCENT_FALLBACK;
}
