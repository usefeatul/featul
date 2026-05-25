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
    <Tabs value={selected} onValueChange={onValueChange} className="mt-4 space-y-4">
      <div className="overflow-x-auto mx-0 px-2 sm:-mx-2 sm:px-2 md:-mx-3 md:px-3 lg:mx-0 lg:px-0 scrollbar-hide">
        <TabsList className="min-w-full w-fit lg:w-full overflow-visible bg-[var(--workspace-surface)]">
          {ACCOUNT_SECTIONS.map((item, index) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={index === 0 ? "pl-2 pr-4 text-accent" : "px-4 text-accent"}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}
