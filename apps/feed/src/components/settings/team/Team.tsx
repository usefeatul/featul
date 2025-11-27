"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import { Button } from "@feedgot/ui/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@feedgot/ui/components/table";
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar";
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover";
import { Label } from "@feedgot/ui/components/label";
import { cn } from "@feedgot/ui/lib/utils";
import { MoreVertical } from "lucide-react";
import { client } from "@feedgot/api/client";
import { toast } from "sonner";
import InviteMemberModal from "./InviteMemberModal";
import { getInitials } from "@/utils/user-utils";

type Member = {
  userId: string;
  role: "admin" | "member" | "viewer";
  isOwner?: boolean;
  joinedAt?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
  image?: string;
};
type Invite = {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
};

export default function TeamSection({ slug }: { slug: string }) {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [meId, setMeId] = React.useState<string | null>(null);
  const [menuFor, setMenuFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await client.team.membersByWorkspaceSlug.$get({ slug });
        const data = await res.json();
        if (mounted) {
          setMembers(data?.members || []);
          setInvites(data?.invites || []);
          setMeId(data?.meId || null);
        }
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const refresh = async () => {
    const res = await client.team.membersByWorkspaceSlug.$get({ slug });
    const data = await res.json();
    setMembers(data?.members || []);
    setInvites(data?.invites || []);
    setMeId(data?.meId || null);
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
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
      setMenuFor(null);
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      const res = await client.team.removeMember.$post({ slug, userId });
      if (!res.ok) throw new Error("Remove failed");
      toast.success("Member removed");
      await refresh();
    } catch (e) {
      toast.error("Failed to remove member");
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      const res = await client.team.revokeInvite.$post({ slug, inviteId });
      if (!res.ok) throw new Error("Revoke failed");
      toast.success("Invite revoked");
      await refresh();
    } catch (e) {
      toast.error("Failed to revoke invite");
    }
  };

  const badgeFor = (m: Member) => {
    if (m.isOwner) return "bg-muted text-accent";
    if (m.role === "admin") return "bg-primary/10 text-primary";
    if (m.role === "viewer") return "bg-muted text-accent";
    return "bg-card text-accent";
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
                  <TableHead className="px-4 text-right">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-4 py-6 text-accent">No members</TableCell>
                  </TableRow>
                ) : (
                  members.map((m) => (
                    <TableRow key={m.userId}>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar>
                            <AvatarImage src={m.image || ""} alt={m.name || m.email || ""} />
                            <AvatarFallback>{getInitials(m.name || m.email || "")}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{m.name || m.email || m.userId}</div>
                            <div className="text-xs text-accent truncate">{m.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <span className={cn("text-xs px-2 py-0.5 rounded-md capitalize", badgeFor(m))}>{m.isOwner ? "owner" : m.role}</span>
                          <Popover open={menuFor === m.userId} onOpenChange={(v) => setMenuFor(v ? m.userId : null)}>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="ghost" size="icon-sm" disabled={m.isOwner === true} aria-label="More">
                                <MoreVertical className="size-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent list className="min-w-[160px]">
                              <PopoverList>
                                {(["admin","member","viewer"] as const).map((r) => (
                                  <PopoverListItem key={r} role="menuitemradio" aria-checked={m.role === r} onClick={() => handleRoleChange(m.userId, r)}>
                                    <span className="text-sm capitalize">{r}</span>
                                    {m.role === r ? <span className="ml-auto text-xs">✓</span> : null}
                                  </PopoverListItem>
                                ))}
                              </PopoverList>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pending Invites</Label>
          <div className="divide-y">
            {invites.length === 0 && !loading ? (
              <div className="p-4 text-sm text-accent">No pending invites</div>
            ) : (
              invites.map((i) => (
                <div
                  key={i.id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.email}</div>
                    <div className="text-xs text-accent">
                      Expires {new Date(i.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{i.role}</span>
                    <Button variant="ghost" onClick={() => handleRevoke(i.id)}>
                      Revoke
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
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
