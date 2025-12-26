"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import type { Member } from "@/types/team"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@oreilla/ui/components/table"
import { Avatar, AvatarFallback, AvatarImage } from "@oreilla/ui/components/avatar"
import Link from "next/link"
import { format } from "date-fns"
import { roleBadgeClass } from "@/components/settings/team/role-badge"
import { cn } from "@oreilla/ui/lib/utils"
import { getInitials } from "@/utils/user-utils"
import RoleBadge from "@/components/global/RoleBadge"

interface Props {
  slug: string
  initialMembers?: Member[]
}

export default function MemberList({ slug, initialMembers = [] }: Props) {
  const { data = { members: initialMembers }, isLoading } = useQuery({
    queryKey: ["members", slug],
    queryFn: async () => {
      const res = await client.team.membersByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      return { members: (d?.members || []) as Member[] }
    },
    initialData: { members: initialMembers },
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  })

  const items = data.members || []

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-card dark:bg-black/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Member</TableHead>
              <TableHead className="px-4 w-48 text-center">Role</TableHead>
              <TableHead className="px-4 w-40">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="px-4 py-6 text-accent">No members</TableCell>
              </TableRow>
            ) : (
              items.map((m) => (
                <TableRow key={m.userId} className="cursor-pointer">
                  <TableCell className="px-4">
                    <Link href={`/workspaces/${slug}/members/${m.userId}`} className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="size-8">
                          <AvatarImage src={m.image || ""} alt={m.name || m.email || ""} />
                          <AvatarFallback>{getInitials(m.name || m.email || "")}</AvatarFallback>
                        </Avatar>
                        <RoleBadge role={m.role} isOwner={m.isOwner} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{m.name || m.email || m.userId}</div>
                        <div className="text-xs text-accent truncate">{m.email}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 w-48 text-center">
                    <span className={cn("inline-block h-6 leading-6 text-xs px-2 rounded-sm capitalize", roleBadgeClass(m.role, m.isOwner))}>
                      {m.isOwner ? "owner" : m.role}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 w-40">
                    {m.joinedAt ? format(new Date(m.joinedAt), "MMM d") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
