"use client"

import React from "react"
import SectionCard from "../global/SectionCard"
import { toast } from "sonner"
import { Button } from "@feedgot/ui/components/button"
import AddDomainDialog from "./AddDomainDialog"
import RecordsTable from "./RecordsTable"
import { loadDomain, createDomain, verifyDomain, deleteDomain } from "./service"
import type { DomainInfo } from "./types"
import { Label } from "@feedgot/ui/components/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@feedgot/ui/components/table"

export default function DomainSection({ slug }: { slug: string }) {
  const [plan, setPlan] = React.useState<string>("free")
  const [defaultDomain, setDefaultDomain] = React.useState<string>("")
  const [info, setInfo] = React.useState<DomainInfo>(null)
  const [loading, setLoading] = React.useState(true)

  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await loadDomain(slug)
      setPlan(data.plan)
      setDefaultDomain(data.defaultDomain)
      setInfo(data.info)
    } catch {}
    finally { setLoading(false) }
  }, [slug])

  React.useEffect(() => { void load() }, [load])

  const canUse = plan === "starter" || plan === "professional"
  const hostBase = (() => { try { return new URL(defaultDomain).host } catch { return defaultDomain.replace(/^https?:\/\//, "") } })()
  const suggested = hostBase ? `https://feedback.${hostBase}` : ""

  const handleCreate = async (base: string) => {
    if (!canUse) { toast.error("Upgrade to Starter or Professional to use a custom domain"); return }
    const v = base.trim()
    if (!v) { toast.error("Enter a domain"); return }
    setSaving(true)
    try {
      const result = await createDomain(slug, v)
      if (!result.ok) throw new Error(result.message || "Failed to add domain")
      toast.success("Domain added. Configure DNS and verify.")
      setOpen(false)
      await load()
    } catch (e: any) {
      toast.error(e?.message || "Failed to add domain")
    } finally { setSaving(false) }
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const result = await verifyDomain(slug)
      if (!result.ok) throw new Error(result?.message || "Verify failed")
      if (result?.status === "verified") toast.success("Domain verified")
      else toast.info("Records not found yet. Still pending.")
      await load()
    } catch (e: any) {
      toast.error(e?.message || "Failed to verify domain")
    } finally { setVerifying(false) }
  }

  return (
    <SectionCard title="Manage Domain" description="Create a custom domain for your workspace.">
      <div className="space-y-6">
        <div className="space-y-2">
          {info?.host ? (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{info.host}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="quiet" onClick={handleVerify} disabled={verifying}>{verifying ? "Verifying..." : "Verify"}</Button>
                <Button type="button" variant="destructive" onClick={async () => { const r = await deleteDomain(slug); if (!r.ok) { toast.error(r.message || 'Delete failed'); return } toast.success('Domain deleted'); await load() }}>Delete</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm text-accent">No custom domain configured</span>
              <Button type="button" variant="quiet" onClick={() => setOpen(true)} disabled={loading || !canUse}>Add domain</Button>
            </div>
          )}

          {info?.host ? (
            <div className="flex items-center justify-start">
              <Button variant="quiet" asChild>
                <a href={`https://${info.host}`} target="_blank" rel="noopener noreferrer">Visit</a>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>DNS Records</Label>
          <div className="rounded-md border overflow-hidden">
            {info?.host ? (
              <RecordsTable info={info} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-3">Type</TableHead>
                    <TableHead className="px-3">Name</TableHead>
                    <TableHead className="px-3">Value</TableHead>
                    <TableHead className="px-3 w-28 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-6 text-accent">No records</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <div className="text-sm text-accent">Add a custom domain to your workspace.</div>
          <div className="flex items-center justify-start">
            <Button type="button" variant="quiet" onClick={() => setOpen(true)} disabled={loading || !canUse || Boolean(info?.host)}>
              Add domain
            </Button>
          </div>
          {!canUse ? <div className="text-xs text-muted-foreground">Custom domains are available on Starter and Professional plans.</div> : null}
          <AddDomainDialog open={open} onOpenChange={setOpen} onSave={(v) => handleCreate(v)} />
        </div>
      </div>
    </SectionCard>
  )
}
