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
    <Tabs value={selected} onValueChange={onValueChange} className="mt-4 space-y-4">
      <div className="overflow-x-auto mx-0 px-2 sm:-mx-2 sm:px-2 md:-mx-3 md:px-3 lg:-ml-4 lg:mr-0 lg:pl-4 lg:pr-0 scrollbar-hide">
        <TabsList className="min-w-full w-fit lg:w-full overflow-visible bg-[var(--workspace-surface)]">
          {SECTIONS.map((item, index) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={index === 0 ? "-ml-4 px-4 text-accent whitespace-nowrap" : "px-4 text-accent whitespace-nowrap"}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}
