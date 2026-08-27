/** Public workspace appearance (theme, chrome, layout). */
export type BrandingConfig = {
  logoUrl?: string
  primaryColor?: string
  accentColor?: string
  theme?: "light" | "dark" | "system"
  hidePoweredBy?: boolean
  layoutStyle?: "compact" | "comfortable" | "spacious"
  sidebarPosition?: "left" | "right"
}

export type BrandingResponse = { config: BrandingConfig | null }
