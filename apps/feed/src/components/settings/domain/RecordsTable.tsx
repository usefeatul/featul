"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@oreilla/ui/components/table";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { DomainInfo } from "../../../types/domain";
import { dnsStatusBadgeClass } from "../../../types/domain";


export default function RecordsTable({ info }: { info: DomainInfo }) {
  if (!info) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-3">Type</TableHead>
          <TableHead className="px-3">Name</TableHead>
          <TableHead className="px-3">Value</TableHead>
          <TableHead className="px-3 w-28 text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="px-3">CNAME</TableCell>
          <TableCell className="px-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{info.cnameName}</span>
              <button
                type="button"
                aria-label="Copy"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md  bg-muted text-xs cursor-pointer"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(info.cnameName);
                    toast.success("Copied");
                  } catch {}
                }}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </TableCell>
          <TableCell className="px-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{info.cnameTarget}</span>
              <button
                type="button"
                aria-label="Copy"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md  bg-muted text-xs cursor-pointer"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(info.cnameTarget);
                    toast.success("Copied");
                  } catch {}
                }}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </TableCell>
          <TableCell className="px-3 text-center">
            <span className={`text-xs px-2 py-0.5 rounded-md  ${dnsStatusBadgeClass(info.status || "pending")}`}>
              {info.status === "verified" ? "VALID" : "PENDING"}
            </span>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="px-3">TXT</TableCell>
          <TableCell className="px-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{info.txtName}</span>
              <button
                type="button"
                aria-label="Copy"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md  bg-muted text-xs cursor-pointer"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(info.txtName);
                    toast.success("Copied");
                  } catch {}
                }}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </TableCell>
          <TableCell className="px-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{info.txtValue}</span>
              <button
                type="button"
                aria-label="Copy"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md  bg-muted text-xs cursor-pointer"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(info.txtValue);
                    toast.success("Copied");
                  } catch {}
                }}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </TableCell>
          <TableCell className="px-3 text-center">
            <span className={`text-xs px-2 py-0.5 rounded-md  ${dnsStatusBadgeClass(info.status || "pending")}`}>
              {info.status === "verified" ? "VALID" : "PENDING"}
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
