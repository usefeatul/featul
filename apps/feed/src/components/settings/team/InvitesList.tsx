import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@feedgot/ui/components/table";
import type { Invite } from "./types";
import InviteRow from "./InviteRow";

export default function InvitesList({
  slug,
  invites,
  loading,
  onChanged,
}: {
  slug: string;
  invites: Invite[];
  loading: boolean;
  onChanged: () => void;
}) {
  if (invites.length === 0 && !loading) {
    return <div className="p-4 text-sm text-accent">No pending invites</div>;
  }
  return (
    <div className="rounded-md border overflow-hidden">
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
