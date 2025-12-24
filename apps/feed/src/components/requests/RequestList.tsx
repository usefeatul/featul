"use client"

import React from "react"
import RequestItem, { type RequestItemData } from "./RequestItem"
import EmptyRequests from "./EmptyRequests"

function RequestListBase({ items, workspaceSlug, linkBase }: { items: RequestItemData[]; workspaceSlug: string; linkBase?: string }) {
  if (items.length === 0) {
    return <EmptyRequests workspaceSlug={workspaceSlug} />
  }
  return (
    <div className="mt-4 rounded-md border bg-card dark:bg-black/40 overflow-hidden">
      <ul>
        {items.map((p) => (
          <RequestItem key={p.id} item={p} workspaceSlug={workspaceSlug} linkBase={linkBase} />
        ))}
      </ul>
    </div>
  )
}

export default React.memo(RequestListBase)
