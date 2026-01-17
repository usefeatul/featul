"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import { SECTIONS } from "../../../config/sections"

export default function SettingsTabsHeader({ slug, selected }: { slug: string; selected: string }) {
  const router = useRouter()
  const onValueChange = React.useCallback((v: string) => {
    const url = `/workspaces/${slug}/settings/${encodeURIComponent(v)}`
    router.replace(url)
  }, [router, slug])

  return (
    <Tabs value={selected} onValueChange={onValueChange} className="space-y-4">
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <TabsList className="w-max flex-nowrap">
          {SECTIONS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="px-3 text-accent whitespace-nowrap">{item.label}</TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}

