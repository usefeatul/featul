"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import DataImportSection from "./DataImportSection";
import DataExportSection from "./DataExportSection";

type Props = {
  slug: string;
  plan?: string;
};

export default function DataSection({ slug, plan }: Props) {
  return (
    <SectionCard title="Data" description="Manage your workspace data.">
      <div className="space-y-4">
        <DataImportSection slug={slug} plan={plan} />
        <DataExportSection slug={slug} />
        <PlanNotice slug={slug} feature="data_imports" plan={plan} />
      </div>
    </SectionCard>
  );
}
