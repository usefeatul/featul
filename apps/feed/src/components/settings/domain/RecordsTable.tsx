"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@feedgot/ui/components/table"
import type { DomainInfo } from "./types"

export default function RecordsTable({ info }: { info: DomainInfo }) {
  if (!info) return null
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
          <TableCell className="px-3">{info.cnameName}</TableCell>
          <TableCell className="px-3 truncate">{info.cnameTarget}</TableCell>
          <TableCell className="px-3 text-center">{info.status === "verified" ? "VALID" : "PENDING"}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="px-3">TXT</TableCell>
          <TableCell className="px-3 truncate">{info.txtName}</TableCell>
          <TableCell className="px-3 truncate">{info.txtValue}</TableCell>
          <TableCell className="px-3 text-center">{info.status === "verified" ? "VALID" : "PENDING"}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
