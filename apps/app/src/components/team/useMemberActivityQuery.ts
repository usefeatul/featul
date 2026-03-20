"use client"

import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { ActivityItem, PaginatedActivity } from "@/types/activity"
import { fetchMemberActivity } from "@/lib/team-client"
import { teamQueryKeys } from "@/lib/team-query-keys"
import type { MemberActivityCategory } from "@/lib/team"

interface UseMemberActivityQueryInput {
  slug: string
  userId: string
  initialActivity: PaginatedActivity
}

export function useMemberActivityQuery({
  slug,
  userId,
  initialActivity,
}: UseMemberActivityQueryInput) {
  const [categoryFilter, setCategoryFilter] =
    React.useState<MemberActivityCategory>("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const activityQuery = useInfiniteQuery({
    queryKey: teamQueryKeys.memberActivity(
      slug,
      userId,
      categoryFilter,
      statusFilter,
    ),
    queryFn: async ({ pageParam }) => {
      const cursor =
        typeof pageParam === "string" && pageParam.length > 0
          ? pageParam
          : undefined

      return fetchMemberActivity(slug, userId, cursor, 20, {
        categoryFilter,
        statusFilter,
      })
    },
    getNextPageParam: (lastPage) =>
      (lastPage?.nextCursor ?? undefined) as string | undefined,
    initialPageParam: "",
    initialData:
      categoryFilter === "all" && statusFilter === "all"
        ? { pages: [initialActivity], pageParams: [""] }
        : undefined,
    staleTime: 30_000,
    refetchOnMount: false,
  })

  const items = React.useMemo((): ActivityItem[] => {
    const pages = activityQuery.data?.pages || [initialActivity]
    return pages.flatMap((page) => page?.items || [])
  }, [activityQuery.data?.pages, initialActivity])

  return {
    items,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    ...activityQuery,
  }
}
