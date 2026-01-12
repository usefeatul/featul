import React from "react";
import ImportFromCSV from "./cards/ImportFromCSV";
import ImportFromCanny from "./cards/ImportFromCanny";
import ImportFromProductBoard from "./cards/ImportFromProductBoard";
import ImportFromNolt from "./cards/ImportFromNolt";

export default function DataImportSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ImportFromCSV />
      <ImportFromCanny />
      <ImportFromProductBoard />
      <ImportFromNolt />
    </div>
  );
}
