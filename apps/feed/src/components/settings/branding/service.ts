import { client } from "@feedgot/api/client"
import type { BrandingConfig, BrandingResponse } from "./types"

export async function loadBrandingBySlug(slug: string): Promise<BrandingConfig | null> {
  const res = await client.branding.byWorkspaceSlug.$get({ slug })
  const data = (await res.json()) as BrandingResponse
  return data?.config || null
}

export async function saveBranding(slug: string, input: BrandingConfig & { logoUrl?: string }): Promise<boolean> {
  const res = await client.branding.update.$post({
    slug,
    logoUrl: input.logoUrl,
    primaryColor: input.primaryColor,
    accentColor: input.accentColor,
    theme: input.theme,
    hidePoweredBy: input.hidePoweredBy,
  })
  return res.ok
}
