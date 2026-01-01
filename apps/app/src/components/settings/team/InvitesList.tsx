import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@featul/ui/components/table";
import type { Invite } from "../../../types/team";
import InviteRow from "./InviteRow";

interface InvitesListProps {
  slug: string;
  invites: Invite[];
  loading: boolean;
  onChanged: () => void;
}

export default function InvitesList({
  slug,
  invites,
  loading,
  onChanged,
}: InvitesListProps) {
  if (invites.length === 0 && !loading) {
    return (
      <div className="rounded-md  border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Email</TableHead>
              <TableHead className="px-4 w-48 text-center">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} className="px-4 py-6 text-accent">No pending invites</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
  return (
    <div className="rounded-md  border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Email</TableHead>
            <TableHead className="px-4 w-48 text-center">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((i) => (
            <InviteRow key={i.id} slug={slug} i={i} onChanged={onChanged} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
