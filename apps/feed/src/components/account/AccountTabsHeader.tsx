"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@feedgot/ui/components/tabs"
import { ACCOUNT_SECTIONS } from "@/config/account-sections"

export default function AccountTabsHeader({ slug, selected }: { slug: string; selected: string }) {
  const router = useRouter()
  const onValueChange = React.useCallback((v: string) => {
    const url = `/workspaces/${slug}/account/${encodeURIComponent(v)}`
    router.replace(url)
  }, [router, slug])

  return (
    <Tabs value={selected} onValueChange={onValueChange} className="space-y-4">
      <TabsList className="w-full">
        {ACCOUNT_SECTIONS.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="min-h-[36px] px-3 text-accent">{item.label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

