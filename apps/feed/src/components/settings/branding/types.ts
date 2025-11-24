export type BrandingConfig = {
  logoUrl?: string
  primaryColor?: string
  accentColor?: string
  theme?: "light" | "dark" | "system" | "custom"
  hidePoweredBy?: boolean
}

export type BrandingResponse = { config: BrandingConfig | null }
