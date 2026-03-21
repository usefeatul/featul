"use client";

import React from "react";
import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import {
  RequestMultiSelectFilter,
  useRequestMultiSelectFilter,
} from "./request-multi-select-filter";

const options = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
];

export default function StatusAction({
  className = "",
}: {
  className?: string;
}) {
  const allValues = React.useMemo(
    () => options.map((option) => option.value),
    [],
  );
  const { open, setOpen, selected, isAllSelected, toggle, selectAll } =
    useRequestMultiSelectFilter({
      filterKey: "status",
      popoverKey: "status",
      values: allValues,
    });

  return (
    <RequestMultiSelectFilter
      open={open}
      onOpenChange={setOpen}
      className={className}
      ariaLabel="Requests"
      icon={<ListFilterIcon className="w-4 h-4" size={16} />}
      items={options.map((option) => ({
        id: option.value,
        label: option.label,
        value: option.value,
      }))}
      selected={selected}
      isAllSelected={isAllSelected}
      onToggle={toggle}
      onSelectAll={selectAll}
    />
  );
}
