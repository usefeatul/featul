export const PANEL_BASE_WIDTH = 22;
export const PANEL_MAX_WIDTH = PANEL_BASE_WIDTH * 1.3;

export const PANEL_WIDTH_COOKIES = {
  requests: "request-panel-width",
  assistant: "assistant-panel-width",
} as const;

export type PanelKind = keyof typeof PANEL_WIDTH_COOKIES;

export function parsePanelWidth(value: string | number | undefined) {
  const width = typeof value === "number" ? value : Number(value);
  return Number.isFinite(width)
    ? Math.max(PANEL_BASE_WIDTH, Math.min(PANEL_MAX_WIDTH, width))
    : PANEL_BASE_WIDTH;
}
