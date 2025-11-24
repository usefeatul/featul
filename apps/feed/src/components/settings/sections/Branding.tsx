"use client"

import React from "react"
import SectionCard from "../SectionCard"
import { Input } from "@feedgot/ui/components/input"
import { Label } from "@feedgot/ui/components/label"
import { LoadingButton } from "@/components/loading-button"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@feedgot/ui/components/select"
import { BRANDING_COLORS } from "../colors"

export default function BrandingSection({ slug }: { slug: string }) {
  const [logoUrl, setLogoUrl] = React.useState("")
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6")
  const [accentColor, setAccentColor] = React.useState("#60a5fa")
  const [colorKey, setColorKey] = React.useState<string>("blue")
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        const res = await client.branding.byWorkspaceSlug.$get({ slug })
        const data = await res.json()
        const conf = data?.config
        if (mounted && conf) {
          setLogoUrl(conf.logoUrl || "")
          const currentPrimary = conf.primaryColor || "#3b82f6"
          const found = BRANDING_COLORS.find((c) => c.primary.toLowerCase() === currentPrimary.toLowerCase())
          setPrimaryColor(currentPrimary)
          setAccentColor(conf.accentColor || found?.accent || "#60a5fa")
          setColorKey(found?.key || "blue")
        }
      } catch (e) {}
      finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [slug])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const root = document.documentElement
    const prevP = getComputedStyle(root).getPropertyValue("--primary").trim()
    const p = primaryColor.trim()
    const a = accentColor.trim()
    root.style.setProperty("--primary", p)
    root.style.setProperty("--ring", p)
    root.style.setProperty("--sidebar-primary", p)
    try {
      const res = await client.branding.update.$post({ slug, logoUrl: logoUrl.trim(), primaryColor: p, accentColor: a })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Update failed")
      }
      toast.success("Branding updated")
    } catch (e) {
      root.style.setProperty("--primary", prevP || "#3b82f6")
      root.style.setProperty("--ring", prevP || "#3b82f6")
      root.style.setProperty("--sidebar-primary", prevP || "#3b82f6")
      toast.error("Failed to update branding")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard title="Branding" description="Customize your logo and identity">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logo">Logo URL</Label>
          <Input id="logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="placeholder:text-accent/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Brand Color</Label>
          <div className="flex items-center gap-2">
            <Select value={colorKey} onValueChange={(k) => {
              const c = BRANDING_COLORS.find((x) => x.key === k) || BRANDING_COLORS[0]
              setColorKey(k)
              const p = c?.primary ?? "#3b82f6"
              const a = c?.accent ?? "#60a5fa"
              setPrimaryColor(p)
              setAccentColor(a)
              const root = document.documentElement
              root.style.setProperty("--primary", p)
              root.style.setProperty("--ring", p)
              root.style.setProperty("--sidebar-primary", p)
            }}>
              <SelectTrigger id="color" className="min-w-[12rem]">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {BRANDING_COLORS.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-sm border" style={{ background: c.primary }} />
                      <span>{c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div aria-hidden className="w-6 h-6 rounded border" style={{ backgroundColor: primaryColor }} />
      </div>
          <p className="text-xs text-accent">Applies to primary accents across the workspace.</p>
        </div>
        <div className="pt-2">
          <LoadingButton onClick={handleSave} loading={saving} disabled={loading}>Save Changes</LoadingButton>
        </div>
      </div>
    </SectionCard>
  )
}
