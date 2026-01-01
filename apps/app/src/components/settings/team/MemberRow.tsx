import React from "react";
import { TableRow, TableCell } from "@featul/ui/components/table";
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import RoleCell from "./RoleCell";
import type { Member } from "../../../types/team";
import { getInitials } from "@/utils/user-utils";

interface MemberRowProps {
  m: Member;
  menuFor: string | null;
  setMenuFor: (id: string | null) => void;
  onRoleChange: (userId: string, role: "admin" | "member" | "viewer") => void;
  onRemoveMember: (userId: string) => void;
}

export default function MemberRow({
  m,
  menuFor,
  setMenuFor,
  onRoleChange,
  onRemoveMember,
}: MemberRowProps) {
  return (
    <TableRow>
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
      <RoleCell m={m} menuFor={menuFor} setMenuFor={setMenuFor} onRoleChange={onRoleChange} onRemoveMember={onRemoveMember} />
    </TableRow>
  );
}
