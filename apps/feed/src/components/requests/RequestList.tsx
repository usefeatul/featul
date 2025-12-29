"use client"

import React from "react"
import RequestItem, { type RequestItemData } from "./RequestItem"
import EmptyRequests from "./EmptyRequests"

function RequestListBase({ items, workspaceSlug, linkBase }: { items: RequestItemData[]; workspaceSlug: string; linkBase?: string }) {
  if (items.length === 0) {
    return <EmptyRequests workspaceSlug={workspaceSlug} />
  }
  return (
    <div className="overflow-hidden rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-background bg-card dark:bg-black/40 border border-border">
      <ul className="m-0 list-none p-0">
        {items.map((p) => (
          <RequestItem key={p.id} item={p} workspaceSlug={workspaceSlug} linkBase={linkBase} />
        ))}
      </ul>
    </div>
  )
}

export default React.memo(RequestListBase)
