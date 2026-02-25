import React from "react";
import { TableCell } from "@featul/ui/components/table";
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { MoreVertical } from "lucide-react";
import type { Member } from "../../../types/team";
import { roleBadgeClass } from "./role-badge";

interface RoleCellProps {
  m: Member;
  menuFor: string | null;
  setMenuFor: (id: string | null) => void;
  onRoleChange: (userId: string, role: "admin" | "member" | "viewer") => void;
  onRemoveMember: (userId: string) => void;
}

export default function RoleCell({
  m,
  menuFor,
  setMenuFor,
  onRoleChange,
  onRemoveMember,
}: RoleCellProps) {
  return (
    <TableCell className="px-4 w-48">
      <div className="grid min-h-8 grid-cols-[2rem_1fr_2rem] items-center">
        <span className={cn("col-start-2 text-xs px-2 py-0.5 rounded-sm capitalize justify-self-center", roleBadgeClass(m.role, m.isOwner))}>
          {m.isOwner ? "owner" : m.role}
        </span>
        <div className="col-start-3 justify-self-end">
          <Popover open={menuFor === m.userId} onOpenChange={(v) => setMenuFor(v ? m.userId : null)}>
            <PopoverTrigger asChild>
              <Button type="button" variant="nav" size="icon-sm" disabled={m.isOwner === true} aria-label="More">
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
