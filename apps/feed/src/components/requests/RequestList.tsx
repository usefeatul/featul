"use client"

import React from "react"
import RequestItem, { type RequestItemData } from "./RequestItem"

function RequestListBase({ items, workspaceSlug }: { items: RequestItemData[]; workspaceSlug: string }) {
  if (items.length === 0) {
    return <div className="text-accent text-sm">No requests found</div>
  }
  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <RequestItem key={p.id} item={p} workspaceSlug={workspaceSlug} />
      ))}
    </ul>
  )
}

export default React.memo(RequestListBase)

