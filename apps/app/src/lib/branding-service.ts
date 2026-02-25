import { client } from "@featul/api/client"
import type { BrandingConfig, BrandingResponse } from "../types/branding"

export async function loadBrandingBySlug(slug: string): Promise<BrandingConfig | null> {
  const res = await client.branding.byWorkspaceSlug.$get({ slug })
  const data = (await res.json()) as BrandingResponse
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
  let message: string | undefined
  try {
    const data = await res.json() as SaveBrandingResponse
    message = data?.message
  } catch {
    // response might not be json
  }
  return { ok: res.ok, message }
}

interface GetUploadUrlResponse {
  uploadUrl: string
  key: string
  publicUrl: string
}

export async function getLogoUploadUrl(slug: string, fileName: string, contentType: string, fileSize: number): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await client.storage.getUploadUrl.$post({ slug, fileName, contentType, fileSize, folder: "branding/logo" })
  const data = await res.json() as GetUploadUrlResponse
  return { uploadUrl: data.uploadUrl, key: data.key, publicUrl: data.publicUrl }
}

interface UpdateWorkspaceNameResponse {
  message?: string
  name?: string
}

export async function updateWorkspaceName(slug: string, name: string): Promise<{ ok: boolean; message?: string; name?: string }> {
  const res = await client.workspace.updateName.$post({ slug, name })
  let message: string | undefined
  let responseData: UpdateWorkspaceNameResponse | undefined
  try {
    responseData = await res.json() as UpdateWorkspaceNameResponse
    message = responseData?.message
  } catch {
    // response might not be json
  }
  return { ok: res.ok, message, name: responseData?.name }
}
