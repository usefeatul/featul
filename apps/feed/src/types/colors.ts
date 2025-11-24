export type ColorOption = {
  key: string
  name: string
  primary: string
  accent: string
}

export const BRANDING_COLORS: ColorOption[] = [
  { key: "orange", name: "Orange", primary: "#f97316", accent: "#fb923c" },
  { key: "blue", name: "Blue", primary: "#3b82f6", accent: "#60a5fa" },
  { key: "indigo", name: "Indigo", primary: "#6366f1", accent: "#818cf8" },
  { key: "purple", name: "Purple", primary: "#a855f7", accent: "#c084fc" },
  { key: "pink", name: "Pink", primary: "#ec4899", accent: "#f472b6" },
  { key: "red", name: "Red", primary: "#ef4444", accent: "#f87171" },
  { key: "rose", name: "Rose", primary: "#f43f5e", accent: "#fb7185" },
  { key: "amber", name: "Amber", primary: "#f59e0b", accent: "#fbbf24" },
  { key: "yellow", name: "Yellow", primary: "#eab308", accent: "#facc15" },
  { key: "lime", name: "Lime", primary: "#84cc16", accent: "#a3e635" },
  { key: "green", name: "Green", primary: "#22c55e", accent: "#4ade80" },
  { key: "emerald", name: "Emerald", primary: "#10b981", accent: "#34d399" },
  { key: "teal", name: "Teal", primary: "#14b8a6", accent: "#2dd4bf" },
  { key: "cyan", name: "Cyan", primary: "#06b6d4", accent: "#22d3ee" },
  { key: "sky", name: "Sky", primary: "#0ea5e9", accent: "#38bdf8" }
]

export function findColorByPrimary(hex: string): ColorOption | undefined {
  const h = hex.trim().toLowerCase()
  return BRANDING_COLORS.find((c) => c.primary.toLowerCase() === h)
}

export function applyBrandPrimary(hex: string): void {
  const root = document.documentElement
  const p = hex.trim()
  root.style.setProperty("--primary", p)
  root.style.setProperty("--ring", p)
  root.style.setProperty("--sidebar-primary", p)
}
