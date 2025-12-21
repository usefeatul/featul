import React from "react";
import { TableRow, TableCell } from "@oreilla/ui/components/table";
import { Button } from "@oreilla/ui/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@oreilla/ui/components/avatar";
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover";
import { cn } from "@oreilla/ui/lib/utils";
import { MoreVertical } from "lucide-react";
import type { Invite } from "../../../types/team";
import { getInitials } from "@/utils/user-utils";
import { client } from "@oreilla/api/client";
import { toast } from "sonner";
import { roleBadgeClass } from "./role-badge";


export default function InviteRow({
  slug,
  i,
  onChanged,
}: {
  slug: string;
  i: Invite;
  onChanged: () => void;
}) {
  const [menuFor, setMenuFor] = React.useState<string | null>(null);
  const updatingRef = React.useRef(false);

  const handleUpdateRole = async (newRole: "admin" | "member" | "viewer") => {
    if (updatingRef.current) return;
    if (newRole === i.role) {
      setMenuFor(null);
      return;
    }
    updatingRef.current = true;
    try {
      const revokeRes = await client.team.revokeInvite.$post({ slug, inviteId: i.id });
      if (!revokeRes.ok) {
        const err = (await revokeRes.json().catch(() => null)) as { message?: string } | null;
        throw new Error(err?.message || "Revoke failed");
      }
      const inviteRes = await client.team.invite.$post({ slug, email: i.email, role: newRole });
      if (!inviteRes.ok) {
        const err = (await inviteRes.json().catch(() => null)) as { message?: string } | null;
        throw new Error(err?.message || "Invite failed");
      }
      toast.success("Invite updated");
      onChanged();
      setMenuFor(null);
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || "Failed to update invite");
    } finally {
      updatingRef.current = false;
    }
  };

  const handleRevoke = async () => {
    if (updatingRef.current) return;
    updatingRef.current = true;
    try {
      const res = await client.team.revokeInvite.$post({ slug, inviteId: i.id });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(err?.message || "Revoke failed");
      }
      toast.success("Invite revoked");
      onChanged();
      setMenuFor(null);
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || "Failed to revoke invite");
    } finally {
      updatingRef.current = false;
    }
  };

  return (
    <TableRow>
      <TableCell className="px-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar>
            <AvatarImage src="" alt={i.email} />
            <AvatarFallback>{getInitials(i.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{i.email}</div>
            <div className="text-xs text-accent">Expires {new Date(i.expiresAt).toLocaleDateString()}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 w-48">
        <div className="relative h-6">
          <span className={cn("text-xs px-2 py-0.5 rounded-md  capitalize absolute left-1/2 -translate-x-1/2", roleBadgeClass(i.role))}>{i.role}</span>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Popover open={menuFor === i.id} onOpenChange={(v) => setMenuFor(v ? i.id : null)}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="More">
                  <MoreVertical className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent list className="min-w-0 w-fit">
                <PopoverList>
                  {(["admin", "member", "viewer"] as const).map((r) => (
                    <PopoverListItem
                      key={r}
                      role="menuitemradio"
                      aria-checked={i.role === r}
                      onClick={() => handleUpdateRole(r)}
                    >
                      <span className="text-sm capitalize">{r}</span>
                      {i.role === r ? <span className="ml-auto text-xs">✓</span> : null}
                    </PopoverListItem>
                  ))}
                  <PopoverListItem role="menuitem" onClick={handleRevoke}>
                    <span className="text-sm">Revoke</span>
                  </PopoverListItem>
                </PopoverList>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
