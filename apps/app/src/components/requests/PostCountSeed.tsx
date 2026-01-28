"use client"

import React from "react"
import { useQueryClient, type QueryKey } from "@tanstack/react-query"

export default function PostCountSeed({ slug, statuses, boards, tags, search, count }: { slug: string; statuses: string[]; boards: string[]; tags: string[]; search: string; count: number }) {
  const qc = useQueryClient()
  React.useEffect(() => {
    const key: QueryKey = ["post-count", slug, statuses, boards, tags, search]
    qc.setQueryData(key, count)
  }, [qc, slug, statuses, boards, tags, search, count])
  return null
}
