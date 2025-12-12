import { client } from "@oreilla/api/client"
import type { BrandingConfig, BrandingResponse } from "../types/branding"

export async function loadBrandingBySlug(slug: string): Promise<BrandingConfig | null> {
  const res = await client.branding.byWorkspaceSlug.$get({ slug })
  const data = (await res.json()) as BrandingResponse
  return data?.config || null
}

export async function saveBranding(slug: string, input: BrandingConfig & { logoUrl?: string }): Promise<{ ok: boolean; message?: string }> {
  const res = await client.branding.update.$post({
    slug,
    logoUrl: input.logoUrl,
    primaryColor: input.primaryColor,
    theme: input.theme,
    hidePoweredBy: input.hidePoweredBy,
    layoutStyle: input.layoutStyle,
    sidebarPosition: input.sidebarPosition,
  })
  let message: string | undefined
  try {
    const data = await res.json()
    message = (data as any)?.message
  } catch {}
  return { ok: res.ok, message }
}

export async function getLogoUploadUrl(slug: string, fileName: string, contentType: string): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await client.storage.getUploadUrl.$post({ slug, fileName, contentType, folder: "branding/logo" })
  const data = await res.json()
  return { uploadUrl: data.uploadUrl, key: data.key, publicUrl: data.publicUrl }
}

export async function updateWorkspaceName(slug: string, name: string): Promise<{ ok: boolean; message?: string; name?: string }> {
  const res = await client.workspace.updateName.$post({ slug, name })
  let message: string | undefined
  let data: any
  try {
    data = await res.json()
    message = (data as any)?.message
  } catch {}
  return { ok: res.ok, message, name: (data as any)?.name }
}
