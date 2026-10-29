"use client";

import React from "react";
import PlanNotice from "../global/PlanNotice";
import ApiKeys from "./ApiKeys";
import { isIntegrationsAllowed } from "@/lib/plan";

type Props = {
  slug: string;
  plan?: string;
};

export default function DevelopersSection({ slug, plan }: Props) {
  return (
    <div className="space-y-8">
      <ApiKeys slug={slug} allowed={isIntegrationsAllowed(plan ?? "free")} />
      <PlanNotice slug={slug} plan={plan} feature="integrations" />
    </div>
  );
}
