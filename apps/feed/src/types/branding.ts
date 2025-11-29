export type BrandingConfig = {
  logoUrl?: string
  primaryColor?: string
  accentColor?: string
  theme?: "light" | "dark" | "system"
  hidePoweredBy?: boolean
}

export type BrandingResponse = { config: BrandingConfig | null }
