"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import { Button } from "@featul/ui/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@featul/ui/components/table";
import { Label } from "@featul/ui/components/label";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import InviteMemberModal from "./InviteMemberModal";
import { useCanInvite } from "@/hooks/useWorkspaceAccess";
import MemberRow from "./MemberRow";
import InvitesList from "./InvitesList";
import type { Member, Invite } from "../../../types/team";

interface TeamSectionProps {
  slug: string;
  initialMembers?: Member[];
  initialInvites?: Invite[];
  initialMeId?: string | null;
  initialPlan?: string;
}

interface TeamQueryData {
  members: Member[];
  invites: Invite[];
  meId: string | null;
}

export default function TeamSection({
  slug,
  initialMembers,
  initialInvites,
  initialMeId,
  initialPlan,
}: TeamSectionProps) {
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [menuFor, setMenuFor] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const initialData: TeamQueryData | undefined =
    initialMembers || initialInvites || initialMeId
      ? {
          members: initialMembers || [],
          invites: initialInvites || [],
          meId: initialMeId ?? null,
        }
      : undefined;

  const {
    data = initialData || { members: [], invites: [], meId: null },
    isLoading,
    refetch,
  } = useQuery<TeamQueryData>({
    queryKey: ["team", slug],
    queryFn: async (): Promise<TeamQueryData> => {
      const res = await client.team.membersByWorkspaceSlug.$get({ slug });
      const d = (await res.json()) as {
        members?: Member[];
        invites?: Invite[];
        meId?: string | null;
      };

      return {
        members: d?.members || [],
        invites: d?.invites || [],
        meId: d?.meId ?? null,
      };
    },
    initialData,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
  const { loading: inviteAccessLoading, canInvite } = useCanInvite(slug);

  const refresh = async (): Promise<void> => {
    await refetch();
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "member" | "viewer"
  ): Promise<void> => {
    try {
      const res = await client.team.updateRole.$post({
        slug,
        userId,
        role: newRole,
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(err?.message || "Update failed");
      }
      toast.success("Role updated");
      queryClient.setQueryData<TeamQueryData>(["team", slug], (prev) => {
        const current: TeamQueryData = prev || {
          members: [],
          invites: [],
          meId: null,
        };

        const nextMembers = current.members.map((member) =>
          member.userId === userId ? { ...member, role: newRole } : member
        );

        return { ...current, members: nextMembers };
      });
      setMenuFor(null);
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string): Promise<void> => {
    try {
      const res = await client.team.removeMember.$post({ slug, userId });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(err?.message || "Remove failed");
      }
      toast.success("Member removed");
      queryClient.setQueryData<TeamQueryData>(["team", slug], (prev) => {
        const current: TeamQueryData = prev || {
          members: [],
          invites: [],
          meId: null,
        };

        const nextMembers = current.members.filter(
          (member) => member.userId !== userId
        );

        return { ...current, members: nextMembers };
      });
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || "Failed to remove member");
    }
  };

  return (
    <SectionCard title="Manage Members" description="Members have access to your workspace.">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="rounded-md  border overflow-hidden">
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
                <PlanNotice slug={slug} feature="team" plan={initialPlan} membersCount={(data.members || []).length} />
          <div className="mt-2 flex items-center justify-start">
            <Button
              type="button"
              onClick={() => setInviteOpen(true)}
              disabled={isLoading || inviteAccessLoading || !canInvite}
            >
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
