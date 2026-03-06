import { client } from "@featul/api/client"
import { readJson, safeJson } from "@/lib/api-response"
import type { BrandingConfig, BrandingResponse } from "../types/branding"

export async function loadBrandingBySlug(slug: string): Promise<BrandingConfig | null> {
  const res = await client.branding.byWorkspaceSlug.$get({ slug })
  const data = await readJson<BrandingResponse>(res)
  return data?.config || null
}

interface SaveBrandingResponse {
  message?: string
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
  const data = await safeJson<SaveBrandingResponse>(res)
  const message = data?.message
  return { ok: res.ok, message }
}

interface GetUploadUrlResponse {
  uploadUrl: string
  key: string
  publicUrl: string
}

export async function getLogoUploadUrl(slug: string, fileName: string, contentType: string, fileSize: number): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await client.storage.getUploadUrl.$post({ slug, fileName, contentType, fileSize, folder: "branding/logo" })
  const data = await readJson<GetUploadUrlResponse>(res)
  return { uploadUrl: data.uploadUrl, key: data.key, publicUrl: data.publicUrl }
}

interface UpdateWorkspaceNameResponse {
  message?: string
  name?: string
}

export async function updateWorkspaceName(slug: string, name: string): Promise<{ ok: boolean; message?: string; name?: string }> {
  const res = await client.workspace.updateName.$post({ slug, name })
  const responseData = await safeJson<UpdateWorkspaceNameResponse>(res)
  return { ok: res.ok, message: responseData?.message, name: responseData?.name }
}
