"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import { ACCOUNT_SECTIONS } from "@/config/account-sections"

export default function AccountTabsHeader({ slug, selected }: { slug: string; selected: string }) {
  const router = useRouter()
  const onValueChange = React.useCallback((v: string) => {
    const url = `/workspaces/${slug}/account/${encodeURIComponent(v)}`
    router.replace(url)
  }, [router, slug])

  return (
    <Tabs value={selected} onValueChange={onValueChange} className="mt-7.5 space-y-4">
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <TabsList className="min-w-full w-fit lg:w-full overflow-visible">
          {ACCOUNT_SECTIONS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="px-3 text-accent">{item.label}</TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}

