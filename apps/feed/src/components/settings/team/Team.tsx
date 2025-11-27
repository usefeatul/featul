"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import { Button } from "@feedgot/ui/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@feedgot/ui/components/table";
import { Label } from "@feedgot/ui/components/label";
import { client } from "@feedgot/api/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import InviteMemberModal from "./InviteMemberModal";
import MemberRow from "./MemberRow";
import InvitesList from "./InvitesList";
import type { Member, Invite } from "./types";

 

export default function TeamSection({
  slug,
  initialMembers,
  initialInvites,
  initialMeId,
}: { slug: string; initialMembers?: Member[]; initialInvites?: Invite[]; initialMeId?: string | null }) {
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [menuFor, setMenuFor] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data = { members: initialMembers || [], invites: initialInvites || [], meId: initialMeId ?? null }, isLoading, refetch } = useQuery({
    queryKey: ["team", slug],
    queryFn: async () => {
      const res = await client.team.membersByWorkspaceSlug.$get({ slug });
      const d = await res.json();
      return { members: d?.members || [], invites: d?.invites || [], meId: d?.meId || null };
    },
    initialData: (initialMembers || initialInvites || initialMeId) ? { members: initialMembers || [], invites: initialInvites || [], meId: initialMeId ?? null } : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });



  const refresh = async () => {
    await refetch();
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "member" | "viewer"
  ) => {
    try {
      const res = await client.team.updateRole.$post({
        slug,
        userId,
        role: newRole,
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Role updated");
      queryClient.setQueryData(["team", slug], (prev: any) => {
        const p = prev || { members: [], invites: [], meId: null };
        const nextMembers = (p.members || []).map((m: any) => (m.userId === userId ? { ...m, role: newRole } : m));
        return { ...p, members: nextMembers };
      });
      setMenuFor(null);
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await client.team.removeMember.$post({ slug, userId });
      if (!res.ok) throw new Error("Remove failed");
      toast.success("Member removed");
      queryClient.setQueryData(["team", slug], (prev: any) => {
        const p = prev || { members: [], invites: [], meId: null };
        const nextMembers = (p.members || []).filter((m: any) => m.userId !== userId);
        return { ...p, members: nextMembers };
      });
    } catch (e) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <SectionCard title="Manage Members" description="Members have access to your workspace.">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Name</TableHead>
                  <TableHead className="px-4 w-48 text-center">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.members || []).length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-4 py-6 text-accent">No members</TableCell>
                  </TableRow>
                ) : (
                  (data.members || []).map((m: Member) => (
                    <MemberRow key={m.userId} m={m} menuFor={menuFor} setMenuFor={setMenuFor} onRoleChange={handleRoleChange} onRemoveMember={handleRemoveMember} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pending Invites</Label>
          <InvitesList slug={slug} invites={data.invites || []} loading={isLoading} onChanged={refresh} />
        </div>

        <div className="pt-2 space-y-2">
          <div className="text-sm text-accent">Invite a new member to your workspace.</div>
          <div className="flex items-center justify-start">
            <Button type="button" variant="quiet" onClick={() => setInviteOpen(true)}>
              Invite Member
            </Button>
          </div>
          <InviteMemberModal
            slug={slug}
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            onInvited={async () => {
              await refresh();
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
