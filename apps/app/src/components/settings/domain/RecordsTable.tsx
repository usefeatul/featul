"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@featul/ui/components/table";
import type { DomainInfo } from "../../../types/domain";
import { dnsStatusBadgeClass } from "../../../types/domain";
import CopyValueButton from "./CopyValueButton";

function CopyableValue({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <code
        title={value}
        className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground/95"
      >
        {value}
      </code>
      <CopyValueButton value={value} label={label} />
    </div>
  );
}

export default function RecordsTable({ info }: { info: DomainInfo }) {
  if (!info) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-3 w-20">Type</TableHead>
          <TableHead className="px-3">Name</TableHead>
          <TableHead className="px-3">Value</TableHead>
          <TableHead className="px-3 w-28 text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="px-3 font-medium">CNAME</TableCell>
          <TableCell className="px-3">
            <CopyableValue value={info.cnameName} label="CNAME name" />
          </TableCell>
          <TableCell className="px-3">
            <CopyableValue value={info.cnameTarget} label="CNAME value" />
          </TableCell>
          <TableCell className="px-3 text-center">
            <span className={`text-xs font-medium ${dnsStatusBadgeClass(info.status || "pending")}`}>
              {info.status === "verified" ? "VALID" : "PENDING"}
            </span>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="px-3 font-medium">TXT</TableCell>
          <TableCell className="px-3">
            <CopyableValue value={info.txtName} label="TXT name" />
          </TableCell>
          <TableCell className="px-3">
            <CopyableValue value={info.txtValue} label="TXT value" />
          </TableCell>
          <TableCell className="px-3 text-center">
            <span className={`text-xs font-medium ${dnsStatusBadgeClass(info.status || "pending")}`}>
              {info.status === "verified" ? "VALID" : "PENDING"}
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
