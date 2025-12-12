"use client"

import React from "react"
import SectionCard from "@/components/settings/global/SectionCard"
import { Switch } from "@oreilla/ui/components/switch"
import { Button } from "@oreilla/ui/components/button"
import { LoadingButton } from "@/components/global/loading-button"
import { toast } from "sonner"

export default function Notifications() {
  const [productUpdates, setProductUpdates] = React.useState(true)
  const [mentions, setMentions] = React.useState(true)
  const [invites, setInvites] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const onSave = React.useCallback(async () => {
    if (saving) return
    setSaving(true)
    try {
      toast.success("Notification preferences saved")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }, [saving])

  return (
    <SectionCard title="Notifications" description="Choose how you get alerts">
      <div className="divide-y mt-2">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Product updates</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Mentions</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Switch checked={mentions} onCheckedChange={setMentions} />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Invites</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Switch checked={invites} onCheckedChange={setInvites} />
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <LoadingButton onClick={onSave} loading={saving}>Save</LoadingButton>
      </div>
    </SectionCard>
  )
}
