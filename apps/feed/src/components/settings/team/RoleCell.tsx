import React from "react";
import { TableCell } from "@feedgot/ui/components/table";
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover";
import { Button } from "@feedgot/ui/components/button";
import { cn } from "@feedgot/ui/lib/utils";
import { MoreVertical } from "lucide-react";
import type { Member } from "./team";
import { roleBadgeClass } from "./role-badge";

export default function RoleCell({
  m,
  menuFor,
  setMenuFor,
  onRoleChange,
  onRemoveMember,
}: {
  m: Member;
  menuFor: string | null;
  setMenuFor: (id: string | null) => void;
  onRoleChange: (userId: string, role: "admin" | "member" | "viewer") => void;
  onRemoveMember: (userId: string) => void;
}) {
  return (
    <TableCell className="px-4 w-48">
      <div className="relative h-6">
        <span className={cn("text-xs px-2 py-0.5 rounded-md capitalize absolute left-1/2 -translate-x-1/2", roleBadgeClass(m.role, m.isOwner))}>{m.isOwner ? "owner" : m.role}</span>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Popover open={menuFor === m.userId} onOpenChange={(v) => setMenuFor(v ? m.userId : null)}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" disabled={m.isOwner === true} aria-label="More">
                <MoreVertical className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent list className="min-w-0 w-fit">
              <PopoverList>
                {(["admin", "member", "viewer"] as const).map((r) => (
                  <PopoverListItem
                    key={r}
                    role="menuitemradio"
                    aria-checked={m.role === r}
                    onClick={() => onRoleChange(m.userId, r)}
                  >
                    <span className="text-sm capitalize">{r}</span>
                    {m.role === r ? <span className="ml-auto text-xs">✓</span> : null}
                  </PopoverListItem>
                ))}
                {!m.isOwner ? (
                  <PopoverListItem role="menuitem" onClick={() => onRemoveMember(m.userId)}>
                    <span className="text-sm text-red-500">Remove</span>
                  </PopoverListItem>
                ) : null}
              </PopoverList>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TableCell>
  );
}
